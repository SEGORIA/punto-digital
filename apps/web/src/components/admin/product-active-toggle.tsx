"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/app/admin/productos/actions";
import { cn } from "@/lib/utils";

export function ProductActiveToggle({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleProductActive(productId, !active))}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        active ? "bg-success/10 text-success" : "bg-muted-bg text-muted"
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </button>
  );
}
