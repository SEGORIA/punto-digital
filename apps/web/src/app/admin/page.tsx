import { prisma } from "@punto-digital/db";
import { formatCOP } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersToday, pendingOrders, lowStockVariants, totalProducts] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true },
      take: 10,
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  const salesToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ventas de hoy" value={formatCOP(salesToday)} />
        <StatCard label="Pedidos de hoy" value={String(ordersToday.length)} />
        <StatCard label="Pedidos pendientes" value={String(pendingOrders)} />
        <StatCard label="Productos activos" value={String(totalProducts)} />
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <h2 className="font-semibold mb-4">Stock bajo</h2>
        {lowStockVariants.length === 0 ? (
          <p className="text-sm text-muted">Todo el inventario está en buen nivel.</p>
        ) : (
          <ul className="space-y-2">
            {lowStockVariants.map((v) => (
              <li key={v.id} className="flex justify-between text-sm">
                <span>
                  {v.product.name} — {v.label}
                </span>
                <span className="font-semibold text-danger">{v.stock} unidades</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
