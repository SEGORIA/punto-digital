import { prisma } from "@punto-digital/db";
import { formatCOP } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-bg text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <p>{o.guestName}</p>
                  <p className="text-xs text-muted">{o.guestEmail}</p>
                </td>
                <td className="px-4 py-3">{formatCOP(o.total)}</td>
                <td className="px-4 py-3 text-muted">{o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {o.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
