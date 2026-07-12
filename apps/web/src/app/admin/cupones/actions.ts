"use server";

import { prisma } from "@punto-digital/db";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toLowerCase();
  const discountType = formData.get("discountType") === "PERCENT" ? "PERCENT" : "FIXED";
  const amount = Number(formData.get("amount") || 0);

  if (!code || amount <= 0) return;

  await prisma.coupon.create({
    data: { code, discountType, amount },
  });

  revalidatePath("/admin/cupones");
}

export async function updateCoupon(couponId: string, formData: FormData) {
  const code = String(formData.get("code") || "").trim().toLowerCase();
  const discountType = formData.get("discountType") === "PERCENT" ? "PERCENT" : "FIXED";
  const amount = Number(formData.get("amount") || 0);
  const expiresAtRaw = String(formData.get("expiresAt") || "");

  if (!code || amount <= 0) return;

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      code,
      discountType,
      amount,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    },
  });

  revalidatePath("/admin/cupones");
}

export async function toggleCoupon(couponId: string, active: boolean) {
  await prisma.coupon.update({ where: { id: couponId }, data: { active } });
  revalidatePath("/admin/cupones");
}

export async function deleteCoupon(couponId: string) {
  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/cupones");
}
