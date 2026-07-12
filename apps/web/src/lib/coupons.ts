import { prisma } from "@punto-digital/db";
import type { Coupon } from "@punto-digital/db";

export function calculateDiscount(coupon: Coupon, subtotal: number) {
  if (coupon.discountType === "PERCENT") {
    return Math.round((subtotal * coupon.amount) / 100);
  }
  return Math.min(coupon.amount, subtotal);
}

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toLowerCase() } });

  if (!coupon || !coupon.active) {
    return { valid: false as const, error: "Cupón no válido." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false as const, error: "Este cupón ya expiró." };
  }

  const discountAmount = calculateDiscount(coupon, subtotal);
  return { valid: true as const, coupon, discountAmount };
}
