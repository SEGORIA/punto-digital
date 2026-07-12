"use server";

import { prisma } from "@punto-digital/db";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@punto-digital/db";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/pedidos");
}
