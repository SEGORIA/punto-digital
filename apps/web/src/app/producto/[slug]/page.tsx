import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {product.images[0] ? (
          <ProductImage src={product.images[0]} alt={product.name} />
        ) : (
          <div className="relative aspect-square rounded-2xl bg-muted-bg" />
        )}

        <Reveal delay={0.1} y={20}>
          {product.brand && (
            <span className="text-xs uppercase tracking-wide text-muted">{product.brand}</span>
          )}
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          {product.description && (
            <p className="mt-3 text-sm text-muted leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCart product={product} />
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <h2 className="text-lg font-semibold mb-4">También te puede interesar</h2>
          </Reveal>
          <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <RevealItem key={p.id}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}
    </div>
  );
}
