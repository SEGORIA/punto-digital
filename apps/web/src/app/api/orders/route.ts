import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { checkoutSchema } from "@/lib/schemas";
import { validateCoupon } from "@/lib/coupons";

const FREE_SHIPPING_THRESHOLD = 100_000;
const SHIPPING_COST = 12_000;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, phone, address, city, paymentMethod, items, couponCode } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Lock-free stock check: read current stock and validate before decrementing.
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`STOCK_INSUFICIENTE:${item.variantId}`);
        }
      }

      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

      // El descuento se recalcula en el servidor a partir del código; nunca se confía
      // en el monto que pudiera venir del cliente.
      let discountAmount = 0;
      if (couponCode) {
        const result = await validateCoupon(couponCode, subtotal);
        if (!result.valid) throw new Error(`CUPON_INVALIDO:${result.error}`);
        discountAmount = result.discountAmount;
      }

      const created = await tx.order.create({
        data: {
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          shippingAddress: address,
          shippingCity: city,
          paymentMethod,
          subtotal,
          shippingCost,
          couponCode: couponCode || null,
          discountAmount,
          total: subtotal + shippingCost - discountAmount,
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

    return NextResponse.json({ orderId: order.id }, { status: 201 });
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
}
