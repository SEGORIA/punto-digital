import bcrypt from "bcryptjs";
import { prisma } from "./index";

async function main() {
  const adminEmail = "admin@puntodigitalstore.com.co";
  const adminPassword = await bcrypt.hash("cambiar123", 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "Administrador", email: adminEmail, password: adminPassword, role: "ADMIN" },
  });

  const categories = await Promise.all(
    [
      { name: "Audífonos", slug: "audifonos" },
      { name: "Power Banks", slug: "power-banks" },
      { name: "Cargadores", slug: "cargadores" },
      { name: "Diademas Bluetooth", slug: "diademas-bluetooth" },
      { name: "Altavoces", slug: "altavoces" },
    ].map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );

  const [audifonos, powerBanks, cargadores, diademas, altavoces] = categories;

  const products = [
    {
      name: "Audífonos Bluetooth Moxom MX-VC1",
      slug: "audifonos-bluetooth-moxom-mx-vc1",
      brand: "Moxom",
      description: "Audífonos inalámbricos con cancelación de ruido y batería de larga duración.",
      basePrice: 89900,
      categoryId: audifonos.id,
      images: ["/products/moxom-mx-vc1.jpg"],
      variants: [{ sku: "MOX-MXVC1-BLK", label: "Negro", stock: 25 }],
    },
    {
      name: "Power Bank Recci 20000mAh",
      slug: "power-bank-recci-20000mah",
      brand: "Recci",
      description: "Batería portátil de carga rápida 20000mAh con dos puertos USB.",
      basePrice: 129900,
      categoryId: powerBanks.id,
      images: ["/products/recci-20000.jpg"],
      variants: [{ sku: "RECCI-PB20K", label: "Estándar", stock: 15 }],
    },
    {
      name: "Cargador Rápido Joyroom 20W",
      slug: "cargador-rapido-joyroom-20w",
      brand: "Joyroom",
      description: "Cargador de pared con carga rápida PD 20W, incluye cable USB-C.",
      basePrice: 49900,
      categoryId: cargadores.id,
      images: ["/products/joyroom-20w.jpg"],
      variants: [{ sku: "JOY-C20W-WHT", label: "Blanco", stock: 40 }],
    },
    {
      name: "Diadema Bluetooth Celebrat A18",
      slug: "diadema-bluetooth-celebrat-a18",
      brand: "Celebrat",
      description: "Diadema over-ear con Bluetooth 5.0 y sonido envolvente.",
      basePrice: 99900,
      categoryId: diademas.id,
      images: ["/products/celebrat-a18.jpg"],
      variants: [{ sku: "CEL-A18-BLK", label: "Negro", stock: 3 }],
    },
    {
      name: "Altavoz Bluetooth Moxom Party Box",
      slug: "altavoz-bluetooth-moxom-party-box",
      brand: "Moxom",
      description: "Altavoz portátil resistente al agua con luces LED.",
      basePrice: 159900,
      categoryId: altavoces.id,
      images: ["/products/moxom-partybox.jpg"],
      variants: [{ sku: "MOX-PARTYBOX", label: "Estándar", stock: 10 }],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: productData,
    });

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: { ...v, productId: product.id },
      });
    }
  }

  console.log(`Seed completado: ${products.length} productos, ${categories.length} categorías.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
