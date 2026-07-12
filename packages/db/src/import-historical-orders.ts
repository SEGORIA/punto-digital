import { prisma } from "./index";
import wcOrders from "../data/wc-orders.json";

// WooCommerce no tiene un mapeo 1:1 de estados con nuestro OrderStatus; usamos la
// equivalencia más cercana para conservar el historial de ventas real del negocio.
function mapStatus(wcStatus: string): "PROCESSING" | "DELIVERED" | "CANCELLED" | "PENDING" {
  switch (wcStatus) {
    case "completed":
      return "DELIVERED";
    case "processing":
      return "PROCESSING";
    case "failed":
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function mapPaymentMethod(title: string): "PSE" | "NEQUI" | "CARD" | undefined {
  const t = title.toLowerCase();
  if (t.includes("pse")) return "PSE";
  if (t.includes("nequi")) return "NEQUI";
  if (t.includes("tarjeta") || t.includes("card")) return "CARD";
  return undefined;
}

async function main() {
  let created = 0;
  let skippedExisting = 0;
  const unmatchedItems: string[] = [];

  for (const wc of wcOrders) {
    const externalId = `WC-${wc.id}`;

    // Evita duplicar si el script se corre más de una vez: usa email+total+fecha como huella única.
    const alreadyImported = await prisma.order.findFirst({
      where: {
        guestEmail: wc.billing.email,
        total: Math.round(Number(wc.total)),
        createdAt: new Date(wc.date_created),
      },
    });
    if (alreadyImported) {
      skippedExisting++;
      continue;
    }

    const itemsToCreate: { productId: string; variantId: string; quantity: number; unitPrice: number }[] = [];

    for (const li of wc.line_items) {
      const product = await prisma.product.findFirst({
        where: { name: li.name.split(" - ")[0].trim() },
        include: { variants: true },
      });

      if (!product || product.variants.length === 0) {
        unmatchedItems.push(`Pedido ${externalId}: "${li.name}" no encontrado en nuestra BD`);
        continue;
      }

      itemsToCreate.push({
        productId: product.id,
        variantId: product.variants[0].id,
        quantity: li.quantity,
        unitPrice: Math.round(Number(li.total) / li.quantity),
      });
    }

    if (itemsToCreate.length === 0) {
      unmatchedItems.push(`Pedido ${externalId}: omitido por completo, ningún producto coincidió`);
      continue;
    }

    const subtotal = itemsToCreate.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    await prisma.order.create({
      data: {
        guestName: `${wc.billing.first_name} ${wc.billing.last_name}`.trim(),
        guestEmail: wc.billing.email || null,
        guestPhone: wc.billing.phone || null,
        shippingAddress: wc.billing.address_1 || "N/D",
        shippingCity: wc.billing.city || "N/D",
        status: mapStatus(wc.status),
        paymentMethod: mapPaymentMethod(wc.payment_method_title || ""),
        subtotal,
        shippingCost: Math.round(Number(wc.shipping_total) || 0),
        discountAmount: Math.round(Number(wc.discount_total) || 0),
        couponCode: wc.coupon_lines[0]?.code || null,
        total: Math.round(Number(wc.total)),
        createdAt: new Date(wc.date_created),
        updatedAt: new Date(wc.date_modified),
        items: { create: itemsToCreate },
      },
    });
    created++;
  }

  console.log(`Pedidos históricos importados: ${created}. Ya existentes (omitidos): ${skippedExisting}.`);
  if (unmatchedItems.length > 0) {
    console.log("\nAvisos:");
    unmatchedItems.forEach((m) => console.log(" -", m));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
