import Link from "next/link";
import { searchProducts, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const revalidate = 30;

type SearchParams = {
  q?: string;
  categoria?: string;
  min?: string;
  max?: string;
  orden?: "price-asc" | "price-desc" | "newest";
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([
    searchProducts({
      q: sp.q,
      categorySlug: sp.categoria,
      minPrice: sp.min ? Number(sp.min) : undefined,
      maxPrice: sp.max ? Number(sp.max) : undefined,
      sort: sp.orden,
    }),
    getCategories(),
  ]);

  const buildHref = (overrides: Partial<SearchParams>) => {
    const merged = { ...sp, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/tienda?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {sp.q ? `Resultados para "${sp.q}"` : "Tienda"}
      </h1>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold mb-2">Categorías</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildHref({ categoria: undefined })}
                  className={cn(
                    "text-sm block py-1",
                    !sp.categoria ? "text-brand font-medium" : "text-muted"
                  )}
                >
                  Todas
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildHref({ categoria: cat.slug })}
                    className={cn(
                      "flex items-center gap-2 text-sm py-1",
                      sp.categoria === cat.slug ? "text-brand font-medium" : "text-muted"
                    )}
                  >
                    <CategoryIcon icon={cat.icon} size={16} />
                    {cat.name}
                    <span className="ml-auto text-xs text-muted">{cat._count.products}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2">Ordenar por</h2>
            <ul className="space-y-1">
              {[
                { key: "newest", label: "Más recientes" },
                { key: "price-asc", label: "Precio: menor a mayor" },
                { key: "price-desc", label: "Precio: mayor a menor" },
              ].map((opt) => (
                <li key={opt.key}>
                  <Link
                    href={buildHref({ orden: opt.key as SearchParams["orden"] })}
                    className={cn(
                      "text-sm block py-1",
                      sp.orden === opt.key || (!sp.orden && opt.key === "newest")
                        ? "text-brand font-medium"
                        : "text-muted"
                    )}
                  >
                    {opt.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="text-muted text-sm py-16 text-center">
              No encontramos productos con esos filtros. Escríbenos y te ayudamos a encontrarlo.
            </p>
          ) : (
            <Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
