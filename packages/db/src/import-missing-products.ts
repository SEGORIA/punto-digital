import { prisma } from "./index";
import reconciled from "../data/reconciled-products.json";

// Mismas reglas de categorización por palabra clave usadas en categorize-orphans.ts,
// para clasificar productos nuevos encontrados en WooCommerce que no estaban en la
// importación original (estaban agotados en el momento del primer scrape).
const RULES: { slug: string; keywords: RegExp }[] = [
  { slug: "smartwatches", keywords: /smart\s?watch|smartwatch|reloj/i },
  { slug: "audifonos-y-diademas", keywords: /aud[ií]fono|airpods|earbuds|diadema|auricular/i },
  { slug: "creacion-de-contenido", keywords: /micr[oó]fono|tr[ií]pode|selfie|luz led|ring light|l[aá]piz/i },
  { slug: "accesorios-para-auto", keywords: /carro|auto|moto|bicicleta/i },
  { slug: "cables-y-adaptadores", keywords: /adaptador|cable/i },
  { slug: "cargadores", keywords: /cargador|carga r[aá]pida|charger|receptor bluetooth/i },
  { slug: "power-banks", keywords: /power ?bank|bateria portatil|batería portátil/i },
  { slug: "accesorios-y-protectores", keywords: /vidrio|protector|estuche|funda|stand|soporte/i },
];

async function main() {
  const categories = await prisma.category.findMany();
  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (const wc of reconciled) {
    const exists = await prisma.product.findUnique({ where: { slug: wc.slug } });
    if (exists) continue;

    // Solo importamos los que tienen precio real; sin precio no hay forma de venderlos.
    if (!wc.price || wc.price <= 0) {
      skipped++;
      continue;
    }

    const rule = RULES.find((r) => r.keywords.test(wc.name));
    const categoryId = rule ? bySlug.get(rule.slug) ?? null : null;
    const sku = `WC-${wc.id}`;

    await prisma.product.create({
      data: {
        name: wc.name,
        slug: wc.slug,
        description: wc.description || null,
        basePrice: wc.price,
        active: false, // agotado en el origen; el admin lo activa al reabastecer
        images: [],
        categoryId,
        variants: {
          create: [{ sku, label: "Estándar", stock: 0 }],
        },
      },
    });
    created++;
  }

  console.log(`Productos agotados importados (inactivos): ${created}. Omitidos sin precio: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
