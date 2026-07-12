import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@punto-digital/db";
import { requireApiKey } from "@/lib/api-auth";

function isOrderStatus(value: string): value is OrderStatus {
  return (Object.values(OrderStatus) as string[]).includes(value);
}

// GET /api/v1/orders?status=PENDING - listado de pedidos para que el ERP sincronice fulfillment.
export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const statusParam = req.nextUrl.searchParams.get("status");
  if (statusParam && !isOrderStatus(statusParam)) {
    return NextResponse.json({ error: "status inválido." }, { status: 400 });
  }
  const status: OrderStatus | undefined = statusParam && isOrderStatus(statusParam) ? statusParam : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: { include: { product: true, variant: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: orders });
}
