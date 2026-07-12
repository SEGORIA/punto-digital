"use server";

import { prisma } from "@punto-digital/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  brand: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.coerce.number().int().positive(),
  categoryId: z.string().optional(),
  image: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const parsed = productSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    brand: formData.get("brand") || undefined,
    description: formData.get("description") || undefined,
    basePrice: formData.get("basePrice"),
    categoryId: formData.get("categoryId") || undefined,
    image: formData.get("image") || undefined,
  });

  const sku = `${parsed.slug}-default`.toUpperCase();

  const product = await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      brand: parsed.brand,
      description: parsed.description,
      basePrice: parsed.basePrice,
      categoryId: parsed.categoryId || null,
      images: parsed.image ? [parsed.image] : [],
      variants: {
        create: [{ sku, label: "Estándar", stock: 0 }],
      },
    },
  });

  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const parsed = productSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    brand: formData.get("brand") || undefined,
    description: formData.get("description") || undefined,
    basePrice: formData.get("basePrice"),
    categoryId: formData.get("categoryId") || undefined,
    image: formData.get("image") || undefined,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      brand: parsed.brand,
      description: parsed.description,
      basePrice: parsed.basePrice,
      categoryId: parsed.categoryId || null,
      images: parsed.image ? [parsed.image] : [],
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
}

export async function toggleProductActive(productId: string, active: boolean) {
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidatePath("/admin/productos");
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function adjustStock(variantId: string, delta: number, note?: string) {
  if (delta === 0) return;

  await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    const newStock = variant.stock + delta;
    if (newStock < 0) throw new Error("El stock no puede quedar negativo.");

    await tx.productVariant.update({ where: { id: variantId }, data: { stock: newStock } });
    await tx.inventoryMovement.create({
      data: {
        variantId,
        type: "ADJUSTMENT",
        quantity: delta,
        note: note || "Ajuste manual desde panel admin",
      },
    });
  });

  revalidatePath("/admin/productos");
}

export async function addVariant(productId: string, formData: FormData) {
  const sku = String(formData.get("sku") || "").toUpperCase();
  const label = String(formData.get("label") || "");
  const stock = Number(formData.get("stock") || 0);
  const priceOverrideRaw = formData.get("priceOverride");

  await prisma.productVariant.create({
    data: {
      productId,
      sku,
      label,
      stock,
      priceOverride: priceOverrideRaw ? Number(priceOverrideRaw) : null,
    },
  });

  revalidatePath(`/admin/productos/${productId}`);
}
