import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { requireApiKey } from "@/lib/api-auth";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });

  if (!product) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  return NextResponse.json({ data: product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
    include: { variants: true },
  });

  return NextResponse.json({ data: product });
}
