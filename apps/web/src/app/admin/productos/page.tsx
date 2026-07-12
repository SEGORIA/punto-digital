import Link from "next/link";
import { prisma } from "@punto-digital/db";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductActiveToggle } from "@/components/admin/product-active-toggle";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

type SearchParams = {
  categoria?: string;
  q?: string;
  page?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    ...(sp.categoria === "none"
      ? { categoryId: null }
      : sp.categoria
        ? { category: { slug: sp.categoria } }
        : {}),
    ...(sp.q
      ? { name: { contains: sp.q, mode: "insensitive" as const } }
      : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: Partial<SearchParams>) => {
    const merged = { ...sp, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/admin/productos?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar por nombre..."
          className="rounded-lg border border-border px-3 py-2 text-sm w-64"
        />
        <select
          name="categoria"
          defaultValue={sp.categoria ?? ""}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          <option value="none">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="outline">
          Filtrar
        </Button>
        {(sp.q || sp.categoria) && (
          <Link href="/admin/productos" className="text-xs text-muted hover:text-brand">
            Limpiar filtros
          </Link>
        )}
        <span className="ml-auto text-xs text-muted">{total} productos</span>
      </form>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-bg text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted">{p.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{formatCOP(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span className={stock <= 5 ? "text-danger font-semibold" : ""}>{stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductActiveToggle productId={p.id} active={p.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/productos/${p.id}`} className="text-brand font-medium">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No hay productos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Link
            href={buildHref({ page: String(Math.max(1, page - 1)) })}
            className={cn("px-3 py-1 rounded-lg border border-border", page <= 1 && "pointer-events-none opacity-40")}
          >
            Anterior
          </Link>
          <span className="text-muted">
            Página {page} de {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(Math.min(totalPages, page + 1)) })}
            className={cn(
              "px-3 py-1 rounded-lg border border-border",
              page >= totalPages && "pointer-events-none opacity-40"
            )}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
