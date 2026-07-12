import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { getPayment, mapMpStatusToOrderStatus } from "@/lib/mercadopago";
import { createHmac } from "crypto";

// Verifica la firma que envía Mercado Pago (header x-signature) siguiendo su algoritmo
// oficial: HMAC-SHA256 sobre "id:{dataId};request-id:{requestId};ts:{ts};" con el secreto
// del webhook. Evita que cualquiera pueda simular notificaciones de pago falsas.
function isValidSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto configurado (ej. ambiente de pruebas local)

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("=").map((s) => s.trim()))
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const dataId = body?.data?.id ? String(body.data.id) : req.nextUrl.searchParams.get("data.id");

  if (body?.type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(req, dataId)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  try {
    const payment = await getPayment(dataId);
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ received: true });

    const newStatus = mapMpStatusToOrderStatus(payment.status ?? "pending");

    // Si ya estaba en este estado (o ya finalizado), no repite efectos de inventario.
    if (order.status === newStatus) {
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        mpPaymentId: String(payment.id),
        mpStatusDetail: payment.status_detail ?? null,
      },
    });

    if (newStatus === "CANCELLED" && order.status === "PENDING") {
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        await prisma.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "RETURN",
            quantity: item.quantity,
            note: `Pago rechazado (webhook), pedido ${orderId}`,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error procesando el webhook." }, { status: 500 });
  }
}
