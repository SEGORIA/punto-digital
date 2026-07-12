import { prisma } from "@punto-digital/db";
import { updateCategory, createCategory, deleteCategory } from "./actions";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const [categories, uncategorizedCount] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.count({ where: { categoryId: null } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-muted mt-1">
            El orden define cómo aparecen en la tienda y en la home. Menor número aparece primero.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-bg text-left">
            <tr>
              <th className="px-4 py-3 font-medium w-10"></th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium w-24">Orden</th>
              <th className="px-4 py-3 font-medium w-28">Productos</th>
              <th className="px-4 py-3 font-medium w-40"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const updateWithId = updateCategory.bind(null, cat.id);
              const deleteWithId = deleteCategory.bind(null, cat.id);
              return (
                <tr key={cat.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <CategoryIcon icon={cat.icon} size={18} className="text-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateWithId} className="flex items-center gap-2">
                      <input
                        name="name"
                        defaultValue={cat.name}
                        className="rounded-lg border border-border px-2 py-1 flex-1 min-w-0 max-w-xs"
                      />
                      <input type="hidden" name="order" value={cat.order} />
                      <button type="submit" className="text-xs text-brand font-medium shrink-0">
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateWithId} className="flex items-center gap-2">
                      <input type="hidden" name="name" value={cat.name} />
                      <input
                        name="order"
                        type="number"
                        defaultValue={cat.order}
                        className="w-16 rounded-lg border border-border px-2 py-1"
                      />
                      <button type="submit" className="text-xs text-brand font-medium">
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos?categoria=${cat.slug}`}
                      className="text-brand hover:underline"
                    >
                      {cat._count.products}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteWithId}>
                      <button
                        type="submit"
                        className="text-xs text-danger font-medium"
                        title="Los productos quedarán sin categoría"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-border bg-muted-bg/50">
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-muted italic">Sin categoría</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">
                <Link href="/admin/productos?categoria=none" className="text-brand hover:underline">
                  {uncategorizedCount}
                </Link>
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <form
        action={createCategory}
        className="rounded-2xl border border-border bg-background p-5 flex items-end gap-3 max-w-md"
      >
        <label className="text-sm flex-1">
          <span className="block font-medium mb-1">Nueva categoría</span>
          <input
            name="name"
            required
            placeholder="Ej. Cargadores inalámbricos"
            className="w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <Button type="submit" size="sm">
          + Crear
        </Button>
      </form>
    </div>
  );
}
