"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OrderStatusPoller({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (initialStatus !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        if (data.status && data.status !== "PENDING") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // silencioso: se reintenta en el próximo tick
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, initialStatus, router]);

  return null;
}
