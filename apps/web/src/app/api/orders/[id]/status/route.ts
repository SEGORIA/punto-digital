import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@punto-digital/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });

  if (!order) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ status: order.status });
}
