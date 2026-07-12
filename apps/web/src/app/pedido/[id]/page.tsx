import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@punto-digital/db";
import { formatCOP } from "@/lib/utils";
import { OrderStatusPoller } from "@/components/checkout/order-status-poller";
import { OrderStatusIcon } from "@/components/checkout/order-status-icon";
import { Reveal } from "@/components/motion/reveal";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "pendiente de confirmación del pago",
  PAID: "pagado",
  PROCESSING: "en proceso",
  SHIPPED: "enviado",
  DELIVERED: "entregado",
  CANCELLED: "cancelado",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
      <OrderStatusPoller orderId={order.id} initialStatus={order.status} />
      <OrderStatusIcon pending={order.status === "PENDING"} />

      <Reveal delay={0.15}>
        <h1 className="text-2xl font-bold mt-4">¡Gracias por tu compra, {order.guestName}!</h1>
        <p className="text-muted mt-2">
          Tu pedido <span className="font-mono">#{order.id.slice(-8)}</span> fue recibido y está{" "}
          <span className="font-medium">{STATUS_LABELS[order.status] ?? order.status.toLowerCase()}</span>.
          {order.status === "PENDING" && order.paymentMethod === "PSE" && (
            <> Si ya completaste el pago en tu banco, esta página se actualizará automáticamente en unos segundos.</>
          )}
        </p>
      </Reveal>

      <Reveal delay={0.25} className="mt-8 rounded-2xl border border-border p-5 text-left space-y-3">
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.product.name} ({item.variant.label}) x{item.quantity}
              </span>
              <span>{formatCOP(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span>{formatCOP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Envío</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatCOP(order.shippingCost)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Descuento ({order.couponCode})</span>
              <span className="text-brand">-{formatCOP(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1">
            <span>Total</span>
            <span>{formatCOP(order.total)}</span>
          </div>
        </div>
      </Reveal>

      <Link href="/tienda" className="inline-block mt-8 text-brand font-medium">
        Seguir comprando →
      </Link>
    </div>
  );
}
