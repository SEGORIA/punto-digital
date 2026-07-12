"use client";

import { useTransition } from "react";
import { toggleCoupon } from "@/app/admin/cupones/actions";
import { cn } from "@/lib/utils";

export function CouponToggle({ couponId, active }: { couponId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleCoupon(couponId, !active))}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        active ? "bg-success/10 text-success" : "bg-muted-bg text-muted"
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </button>
  );
}
