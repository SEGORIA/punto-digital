"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/pedidos/actions";
import type { OrderStatus } from "@punto-digital/db";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => updateOrderStatus(orderId, e.target.value as OrderStatus))
      }
      className="rounded-lg border border-border px-2 py-1 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
