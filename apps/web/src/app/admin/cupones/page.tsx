import { prisma } from "@punto-digital/db";
import { createCoupon, updateCoupon, deleteCoupon } from "./actions";
import { CouponToggle } from "@/components/admin/coupon-toggle";
import { Button } from "@/components/ui/button";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cupones</h1>
        <p className="text-sm text-muted mt-1">
          Edita código, tipo y valor de cualquier cupón ya creado y guarda los cambios.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-bg text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const updateWithId = updateCoupon.bind(null, c.id);
              const deleteWithId = deleteCoupon.bind(null, c.id);
              return (
                <tr key={c.id} className="border-t border-border">
                  <td colSpan={4} className="px-4 py-3">
                    <form action={updateWithId} className="flex flex-wrap items-center gap-2">
                      <input
                        name="code"
                        defaultValue={c.code}
                        required
                        className="rounded-lg border border-border px-2 py-1 font-mono w-36"
                      />
                      <select
                        name="discountType"
                        defaultValue={c.discountType}
                        className="rounded-lg border border-border px-2 py-1"
                      >
                        <option value="FIXED">Monto fijo (COP)</option>
                        <option value="PERCENT">Porcentaje (%)</option>
                      </select>
                      <input
                        name="amount"
                        type="number"
                        defaultValue={c.amount}
                        required
                        min={1}
                        className="w-24 rounded-lg border border-border px-2 py-1"
                      />
                      <button type="submit" className="text-xs text-brand font-medium">
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <CouponToggle couponId={c.id} active={c.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteWithId}>
                      <button type="submit" className="text-xs text-danger font-medium">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No hay cupones creados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        action={createCoupon}
        className="rounded-2xl border border-border bg-background p-5 flex flex-wrap items-end gap-3 max-w-xl"
      >
        <label className="text-sm">
          <span className="block font-medium mb-1">Código</span>
          <input
            name="code"
            required
            placeholder="verano20"
            className="rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium mb-1">Tipo</span>
          <select name="discountType" className="rounded-lg border border-border px-3 py-2">
            <option value="FIXED">Monto fijo (COP)</option>
            <option value="PERCENT">Porcentaje (%)</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block font-medium mb-1">Valor</span>
          <input
            name="amount"
            type="number"
            required
            min={1}
            className="w-32 rounded-lg border border-border px-3 py-2"
          />
        </label>
        <Button type="submit" size="sm">
          + Crear cupón
        </Button>
      </form>
    </div>
  );
}
