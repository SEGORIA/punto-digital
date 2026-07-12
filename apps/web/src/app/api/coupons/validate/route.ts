import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code || "");
  const subtotal = Number(body.subtotal || 0);

  if (!code || subtotal <= 0) {
    return NextResponse.json({ valid: false, error: "Datos inválidos." }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  return NextResponse.json({ valid: true, discountAmount: result.discountAmount });
}
