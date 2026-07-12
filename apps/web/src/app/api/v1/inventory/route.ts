import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { requireApiKey } from "@/lib/api-auth";
import { z } from "zod";

const movementSchema = z.object({
  variantId: z.string(),
  type: z.enum(["RESTOCK", "SALE", "ADJUSTMENT", "RETURN"]),
  quantity: z.number().int().refine((v) => v !== 0, "quantity no puede ser 0"),
  note: z.string().optional(),
});

// GET /api/v1/inventory?variantId=xxx - historial de movimientos, para que el ERP reconcilie stock.
export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const variantId = req.nextUrl.searchParams.get("variantId");

  const movements = await prisma.inventoryMovement.findMany({
    where: variantId ? { variantId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ data: movements });
}

// POST /api/v1/inventory - registrar un movimiento de inventario desde el ERP (entrada, salida, ajuste).
export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const parsed = movementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { variantId, type, quantity, note } = parsed.data;

  try {
    const movement = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
      const newStock = variant.stock + quantity;
      if (newStock < 0) throw new Error("STOCK_NEGATIVO");

      await tx.productVariant.update({ where: { id: variantId }, data: { stock: newStock } });
      return tx.inventoryMovement.create({ data: { variantId, type, quantity, note } });
    });

    return NextResponse.json({ data: movement }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "STOCK_NEGATIVO") {
      return NextResponse.json({ error: "El movimiento dejaría el stock en negativo." }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo registrar el movimiento." }, { status: 500 });
  }
}
