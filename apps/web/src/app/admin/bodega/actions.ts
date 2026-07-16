"use server";

import { prisma } from "@punto-digital/db";
import { revalidatePath } from "next/cache";

export type ScannedVariant = {
  variantId: string;
  sku: string;
  barcode: string | null;
  label: string;
  stock: number;
  productName: string;
  image: string | null;
};

export async function lookupByCode(rawCode: string): Promise<ScannedVariant | null> {
  const code = rawCode.trim();
  if (!code) return null;

  const variant = await prisma.productVariant.findFirst({
    where: { OR: [{ barcode: code }, { sku: code }] },
    include: { product: true },
  });
  if (!variant) return null;

  return {
    variantId: variant.id,
    sku: variant.sku,
    barcode: variant.barcode,
    label: variant.label,
    stock: variant.stock,
    productName: variant.product.name,
    image: variant.product.images[0] ?? null,
  };
}

export async function receiveStock(variantId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("La cantidad debe ser un entero positivo.");
  }

  const variant = await prisma.$transaction(async (tx) => {
    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId,
        type: "RESTOCK",
        quantity,
        note: "Ingreso de bodega (escaneo de código de barras)",
      },
    });
    return updated;
  });

  revalidatePath("/admin/bodega");
  revalidatePath("/admin/productos");

  return { newStock: variant.stock };
}
