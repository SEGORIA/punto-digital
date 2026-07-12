import { prisma } from "@punto-digital/db";

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { active: true },
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function searchProducts(params: {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "newest";
}) {
  const { q, categorySlug, minPrice, maxPrice, sort } = params;

  return prisma.product.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(minPrice || maxPrice
        ? {
            basePrice: {
              ...(minPrice ? { gte: minPrice } : {}),
              ...(maxPrice ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    },
    include: { variants: true, category: true },
    orderBy:
      sort === "price-asc"
        ? { basePrice: "asc" }
        : sort === "price-desc"
          ? { basePrice: "desc" }
          : { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true },
  });
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  if (!categoryId) return [];
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    include: { variants: true },
    take: limit,
  });
}
