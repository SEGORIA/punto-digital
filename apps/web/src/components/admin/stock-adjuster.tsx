"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/app/admin/productos/actions";

export function StockAdjuster({ variantId }: { variantId: string }) {
  const [delta, setDelta] = useState(1);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={delta}
        onChange={(e) => setDelta(Number(e.target.value))}
        className="w-16 rounded-lg border border-border px-2 py-1 text-sm"
      />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => adjustStock(variantId, delta))}
        className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand"
      >
        Aplicar
      </button>
    </div>
  );
}
