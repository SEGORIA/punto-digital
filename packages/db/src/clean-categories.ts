import { prisma } from "./index";

// Taxonomía final: agrupa las ~24 categorías crudas importadas de WooCommerce
// (con nombres duplicados/SEO como "Audífonos Bluetooth | Inalámbricos Originales | Punto Digital Store")
// en categorías claras para navegación y para el selector del admin.
const TAXONOMY: {
  name: string;
  slug: string;
  icon: string;
  order: number;
  mergeFrom: string[];
}[] = [
  {
    name: "Audífonos y Diademas",
    slug: "audifonos-y-diademas",
    icon: "Headphones",
    order: 1,
    mergeFrom: [
      "audifonos-bluetooth-inalambricos-originales-punto-digital-st",
      "audifonos-cableados",
      "audifonos",
      "diademas",
      "diademas-gaming",
      "diademas-bluetooth",
    ],
  },
  {
    name: "Cargadores",
    slug: "cargadores",
    icon: "Plug",
    order: 2,
    mergeFrom: ["cargadores", "cargador-de-celular-cubos-de-carga-usb-c"],
  },
  {
    name: "Power Banks",
    slug: "power-banks",
    icon: "BatteryCharging",
    order: 3,
    mergeFrom: ["power-bank-cargador-portatil", "power-banks"],
  },
  {
    name: "Cables y Adaptadores",
    slug: "cables-y-adaptadores",
    icon: "Cable",
    order: 4,
    mergeFrom: ["cables", "cables-y-adaptadores", "conectividad"],
  },
  {
    name: "Altavoces",
    slug: "altavoces",
    icon: "Speaker",
    order: 5,
    mergeFrom: ["parlantes", "altavoces"],
  },
  {
    name: "Accesorios para Auto",
    slug: "accesorios-para-auto",
    icon: "Car",
    order: 6,
    mergeFrom: ["accesorios-para-auto"],
  },
  {
    name: "Almacenamiento",
    slug: "almacenamiento",
    icon: "HardDrive",
    order: 7,
    mergeFrom: ["almacenamiento"],
  },
  {
    name: "Smartwatches",
    slug: "smartwatches",
    icon: "Watch",
    order: 8,
    mergeFrom: ["reloj-inteligente-smartwatch-original"],
  },
  {
    name: "Creación de Contenido",
    slug: "creacion-de-contenido",
    icon: "Video",
    order: 9,
    mergeFrom: ["creacion-de-contenido"],
  },
  {
    name: "Accesorios y Protectores",
    slug: "accesorios-y-protectores",
    icon: "ShieldCheck",
    order: 10,
    mergeFrom: ["accesorios", "vidrios", "teclados", "controles", "estuches"],
  },
];

async function main() {
  const canonicalIdBySlug = new Map<string, string>();

  for (const cat of TAXONOMY) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, order: cat.order },
    });
    canonicalIdBySlug.set(cat.slug, created.id);
  }

  let reassigned = 0;
  let deletedCategories = 0;

  for (const cat of TAXONOMY) {
    const canonicalId = canonicalIdBySlug.get(cat.slug)!;

    for (const oldSlug of cat.mergeFrom) {
      if (oldSlug === cat.slug) continue; // canonical category itself, nothing to merge

      const oldCategory = await prisma.category.findUnique({ where: { slug: oldSlug } });
      if (!oldCategory) continue;

      const result = await prisma.product.updateMany({
        where: { categoryId: oldCategory.id },
        data: { categoryId: canonicalId },
      });
      reassigned += result.count;

      await prisma.category.delete({ where: { id: oldCategory.id } });
      deletedCategories++;
    }
  }

  // Cualquier categoría restante que no forme parte de la taxonomía (residual) se elimina;
  // sus productos (si los hubiera) quedan sin categoría en vez de perderse.
  const canonicalIds = new Set(canonicalIdBySlug.values());
  const leftovers = await prisma.category.findMany({ where: { id: { notIn: [...canonicalIds] } } });
  for (const leftover of leftovers) {
    await prisma.product.updateMany({ where: { categoryId: leftover.id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id: leftover.id } });
    deletedCategories++;
  }

  console.log(
    `Categorías limpiadas: ${TAXONOMY.length} categorías finales, ${reassigned} productos reasignados, ${deletedCategories} categorías obsoletas eliminadas.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
