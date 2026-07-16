"use client";

import { useState, useTransition } from "react";
import { updateVariantBarcode } from "@/app/admin/productos/actions";

export function VariantBarcodeField({
  variantId,
  productId,
  defaultValue,
}: {
  variantId: string;
  productId: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() !== defaultValue) {
          startTransition(() => updateVariantBarcode(variantId, productId, value));
        }
      }}
      disabled={isPending}
      placeholder="Sin código"
      className="w-32 rounded-lg border border-border px-2 py-1 font-mono text-xs outline-none focus:border-brand"
    />
  );
}
