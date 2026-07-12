"use client";

import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

type CardFormData = {
  token: string;
  installments: number;
  payment_method_id: string;
};

const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
if (publicKey) {
  initMercadoPago(publicKey, { locale: "es-CO" });
}

export function CardForm({
  total,
  onSubmit,
}: {
  total: number;
  onSubmit: (data: CardFormData) => void;
}) {
  if (!publicKey) {
    return (
      <p className="text-sm text-muted rounded-lg border border-border p-4">
        El pago con tarjeta aún no está configurado (falta NEXT_PUBLIC_MP_PUBLIC_KEY).
      </p>
    );
  }

  return (
    <CardPayment
      initialization={{ amount: total }}
      customization={{ visual: { style: { theme: "bootstrap" } } }}
      onSubmit={async (formData) => {
        onSubmit({
          token: formData.token!,
          installments: Number(formData.installments),
          payment_method_id: formData.payment_method_id!,
        });
      }}
      onError={(error) => console.error("Error en el formulario de tarjeta:", error)}
    />
  );
}
