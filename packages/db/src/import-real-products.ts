import { prisma } from "./index";
import realProducts from "../data/real-products.json";

function slugifyCategory(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function main() {
  const categoryNames = [...new Set(realProducts.map((p) => p.category).filter(Boolean))] as string[];

  const categoryMap = new Map<string, string>();
  for (const name of categoryNames) {
    const slug = slugifyCategory(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categoryMap.set(name, category.id);
  }

  let created = 0;
  let skipped = 0;

  for (const p of realProducts) {
    if (!p.localImage) {
      skipped++;
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      skipped++;
      continue;
    }

    const sku = (p.sku && p.sku.trim()) || `WC-${p.id}`;

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brand: p.brand ?? null,
        description: p.description || null,
        basePrice: p.price,
        images: [p.localImage],
        categoryId: p.category ? categoryMap.get(p.category) ?? null : null,
        variants: {
          create: [
            {
              sku,
              label: "Estándar",
              stock: p.stock ?? (p.in_stock ? 10 : 0),
            },
          ],
        },
      },
    });
    created++;
  }

  console.log(`Importación completada: ${created} productos creados, ${skipped} omitidos, ${categoryMap.size} categorías.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
