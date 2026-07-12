"use server";

import { prisma } from "@punto-digital/db";
import { revalidatePath } from "next/cache";

export async function updateCategory(categoryId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const order = Number(formData.get("order") || 0);

  if (!name) return;

  await prisma.category.update({
    where: { id: categoryId },
    data: { name, order },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/tienda");
  revalidatePath("/");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

  await prisma.category.create({
    data: { name, slug, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath("/admin/categorias");
}

export async function deleteCategory(categoryId: string) {
  await prisma.product.updateMany({ where: { categoryId }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categorias");
  revalidatePath("/tienda");
  revalidatePath("/");
}
