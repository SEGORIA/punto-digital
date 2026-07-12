import { prisma } from "./index";

// Reglas de palabras clave para asignar categoría a productos que quedaron
// sin categoría tras la importación (datos incompletos del catálogo origen).
const RULES: { slug: string; keywords: RegExp }[] = [
  { slug: "smartwatches", keywords: /smart\s?watch|smartwatch|reloj/i },
  { slug: "audifonos-y-diademas", keywords: /aud[ií]fono|airpods|earbuds|diadema/i },
  { slug: "creacion-de-contenido", keywords: /micr[oó]fono|tr[ií]pode|selfie|luz led|ring light/i },
  { slug: "accesorios-para-auto", keywords: /carro|auto|moto|bicicleta/i },
  { slug: "cables-y-adaptadores", keywords: /adaptador|cable/i },
  { slug: "cargadores", keywords: /cargador|carga r[aá]pida|charger/i },
  { slug: "power-banks", keywords: /power ?bank|bateria portatil|batería portátil/i },
  { slug: "accesorios-y-protectores", keywords: /vidrio|protector|estuche|funda/i },
  {
    slug: "accesorios-y-protectores",
    keywords: /stand|soporte|holder|consola|astronauta|ventilador/i,
  },
];

async function main() {
  const orphans = await prisma.product.findMany({ where: { categoryId: null } });
  const categories = await prisma.category.findMany();
  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let assigned = 0;
  for (const product of orphans) {
    const rule = RULES.find((r) => r.keywords.test(product.name));
    if (!rule) continue;
    const categoryId = bySlug.get(rule.slug);
    if (!categoryId) continue;

    await prisma.product.update({ where: { id: product.id }, data: { categoryId } });
    assigned++;
  }

  const stillOrphan = await prisma.product.count({ where: { categoryId: null } });
  console.log(`Asignados: ${assigned} de ${orphans.length}. Quedan sin categoría: ${stillOrphan}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
