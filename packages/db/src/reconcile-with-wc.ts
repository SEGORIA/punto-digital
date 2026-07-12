import { prisma } from "./index";
import reconciled from "../data/reconciled-products.json";

async function main() {
  let priceFixed = 0;
  let stockUpdated = 0;
  let descriptionUpdated = 0;
  let variantsReplaced = 0;
  let reactivated = 0;
  let notFound = 0;

  for (const wc of reconciled) {
    const product = await prisma.product.findUnique({
      where: { slug: wc.slug },
      include: { variants: true },
    });

    if (!product) {
      notFound++;
      continue;
    }

    const data: { basePrice?: number; description?: string; active?: boolean } = {};

    // Si recuperamos un precio real (>0) y antes estaba en 0/inactivo, lo corregimos y reactivamos.
    if (wc.price > 0 && product.basePrice === 0) {
      data.basePrice = wc.price;
      data.active = true;
      priceFixed++;
      reactivated++;
    } else if (wc.price > 0 && wc.price !== product.basePrice && !wc.variants) {
      // Actualiza el precio base si difiere del original (fuente de verdad = WooCommerce).
      data.basePrice = wc.price;
      priceFixed++;
    }

    if (wc.description && wc.description.length > (product.description?.length ?? 0)) {
      data.description = wc.description.slice(0, 2000);
      descriptionUpdated++;
    }

    if (Object.keys(data).length > 0) {
      await prisma.product.update({ where: { id: product.id }, data });
    }

    if (wc.variants && wc.variants.length > 0) {
      // Reemplaza la variante genérica "Estándar" por las variantes reales (color/talla) de WooCommerce.
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: wc.variants.map((v) => ({
          productId: product.id,
          sku: v.sku,
          label: v.label,
          priceOverride: v.price !== wc.price ? v.price : null,
          stock: v.stock,
        })),
      });
      variantsReplaced++;
    } else if (product.variants.length === 1 && wc.stock !== product.variants[0].stock) {
      // Sincroniza el stock real de la variante única con el dato de WooCommerce.
      await prisma.productVariant.update({
        where: { id: product.variants[0].id },
        data: { stock: wc.stock },
      });
      stockUpdated++;
    }
  }

  console.log(`Precios corregidos: ${priceFixed} (${reactivated} reactivados)`);
  console.log(`Descripciones mejoradas: ${descriptionUpdated}`);
  console.log(`Productos con variantes reales aplicadas: ${variantsReplaced}`);
  console.log(`Stock sincronizado en variante única: ${stockUpdated}`);
  console.log(`No encontrados en nuestra BD (nuevos en origen): ${notFound}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
