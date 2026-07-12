import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { CategoryCard } from "@/components/category-card";
import { HeroSection } from "@/components/hero/hero-section";
import { RevealStagger, RevealItem, Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  return (
    <div>
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <Reveal>
          <h2 className="text-lg font-semibold mb-4">Categorías</h2>
        </Reveal>
        <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <RevealItem key={cat.id}>
              <CategoryCard
                slug={cat.slug}
                name={cat.name}
                icon={cat.icon}
                count={cat._count.products}
              />
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <Reveal className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Más vendidos</h2>
          <Link href="/tienda" className="text-sm text-brand font-medium">
            Ver todo →
          </Link>
        </Reveal>
        <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <RevealItem key={product.id}>
              <ProductCard product={product} />
            </RevealItem>
          ))}
        </RevealStagger>
      </section>
    </div>
  );
}
