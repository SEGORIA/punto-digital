import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";
import { requireApiKey } from "@/lib/api-auth";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  brand: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().int().positive(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        label: z.string(),
        stock: z.number().int().nonnegative().default(0),
        priceOverride: z.number().int().positive().optional(),
      })
    )
    .min(1),
});

// GET /api/v1/products - listado completo con variantes e inventario, para sincronización con el ERP.
export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: products });
}

// POST /api/v1/products - crear producto desde el sistema de gestión externo.
export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { variants, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      images: data.images ?? [],
      variants: { create: variants },
    },
    include: { variants: true },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
