import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { checkoutPaymentSchema } from "@/lib/schemas";
import { validateCoupon } from "@/lib/coupons";
import { createCardPayment, createPsePayment, mapMpStatusToOrderStatus } from "@/lib/mercadopago";

const FREE_SHIPPING_THRESHOLD = 100_000;
const SHIPPING_COST = 12_000;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = checkoutPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const { name, email, phone, address, city, items, couponCode } = data;

  // 1. Crea el pedido en PENDING y reserva stock, igual que el flujo original.
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`STOCK_INSUFICIENTE:${item.variantId}`);
        }
      }

      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

      let discountAmount = 0;
      if (couponCode) {
        const result = await validateCoupon(couponCode, subtotal);
        if (!result.valid) throw new Error(`CUPON_INVALIDO:${result.error}`);
        discountAmount = result.discountAmount;
      }

      const total = Math.max(0, subtotal + shippingCost - discountAmount);

      const created = await tx.order.create({
        data: {
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          shippingAddress: address,
          shippingCity: city,
          paymentMethod: data.paymentMethod,
          subtotal,
          shippingCost,
          couponCode: couponCode || null,
          discountAmount,
          total,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
      });

      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "SALE",
            quantity: -item.quantity,
            note: `Pedido ${created.id}`,
          },
        });
      }

      return created;
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("STOCK_INSUFICIENTE")) {
      return NextResponse.json(
        { error: "Uno o más productos ya no tienen stock suficiente." },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message.startsWith("CUPON_INVALIDO")) {
      return NextResponse.json(
        { error: err.message.replace("CUPON_INVALIDO:", "") },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  // 2. Llama a Mercado Pago según el método de pago elegido. Si esta parte falla por
  // cualquier motivo (credenciales, red, timeout), el pedido ya creado se cancela y
  // el stock reservado se repone: nunca debe quedar inventario "fantasma" retenido.
  try {
    if (data.paymentMethod === "CARD") {
      const mpPayment = await createCardPayment({
        token: data.token,
        transactionAmount: order.total,
        installments: data.installments,
        paymentMethodId: data.cardPaymentMethodId,
        payerEmail: email,
        externalReference: order.id,
      });

      const newStatus = mapMpStatusToOrderStatus(mpPayment.status ?? "rejected");

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          mpPaymentId: String(mpPayment.id),
          mpStatusDetail: mpPayment.status_detail ?? null,
        },
      });

      if (newStatus === "CANCELLED") {
        await restock(order.id, items);
      }

      return NextResponse.json(
        { orderId: order.id, status: newStatus, statusDetail: mpPayment.status_detail },
        { status: 201 }
      );
    }

    // PSE: la aprobación llega vía webhook cuando el comprador vuelve del banco.
    const origin = req.nextUrl.origin;
    const mpPayment = await createPsePayment({
      transactionAmount: order.total,
      payerEmail: email,
      financialInstitution: data.financialInstitution,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      externalReference: order.id,
      callbackUrl: `${origin}/pedido/${order.id}`,
    });

    const redirectUrl = mpPayment.point_of_interaction?.transaction_data?.ticket_url ?? null;
    if (!redirectUrl) {
      throw new Error("Mercado Pago no devolvió una URL de redirección para PSE.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: String(mpPayment.id),
        mpStatusDetail: mpPayment.status_detail ?? null,
      },
    });

    return NextResponse.json({ orderId: order.id, redirectUrl }, { status: 201 });
  } catch (err) {
    console.error(err);
    await restock(order.id, items);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return NextResponse.json(
      { error: "No se pudo procesar el pago con Mercado Pago. Intenta de nuevo." },
      { status: 502 }
    );
  }
}

async function restock(orderId: string, items: { variantId: string; quantity: number }[]) {
  for (const item of items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
    await prisma.inventoryMovement.create({
      data: {
        variantId: item.variantId,
        type: "RETURN",
        quantity: item.quantity,
        note: `Pago rechazado, pedido ${orderId}`,
      },
    });
  }
}
