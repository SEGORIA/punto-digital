"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { formatCOP, cn } from "@/lib/utils";
import { PseForm } from "@/components/checkout/pse-form";
import { CardForm } from "@/components/checkout/card-form";

const PAYMENT_METHODS = [
  { key: "PSE", label: "PSE" },
  { key: "CARD", label: "Tarjeta" },
] as const;

const FREE_SHIPPING_THRESHOLD = 100_000;
const SHIPPING_COST = 12_000;

type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: storeItems, subtotal, clear, hasHydrated } = useCartStore();
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]["key"]>("PSE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personal, setPersonal] = useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Antes de hidratar, se ignora lo persistido en localStorage para que el primer render
  // del cliente coincida con el del servidor (evita el warning de hidratación de React).
  const items = hasHydrated ? storeItems : [];
  const total = hasHydrated ? subtotal() : 0;
  const shipping = total >= FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_COST;
  const discount = coupon?.discountAmount ?? 0;
  const grandTotal = Math.max(0, total + shipping - discount);

  const fieldsComplete =
    personal.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(personal.email) &&
    personal.phone.trim().length >= 7 &&
    personal.address.trim().length >= 5 &&
    personal.city.trim().length >= 2;
  const personalComplete = fieldsComplete && acceptedTerms;

  if (!hasHydrated) {
    return <div className="mx-auto max-w-xl px-4 sm:px-6 py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
        <p className="text-muted">Tu carrito está vacío.</p>
      </div>
    );
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: total }),
      });
      const data = await res.json();

      if (!data.valid) {
        setCoupon(null);
        setCouponError(data.error || "Cupón no válido.");
        return;
      }

      setCoupon({ code: couponInput.trim(), discountAmount: data.discountAmount });
    } catch {
      setCouponError("No pudimos validar el cupón. Intenta de nuevo.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function submitPayment(paymentFields: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);

    const payload = {
      ...personal,
      couponCode: coupon?.code,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      ...paymentFields,
    };

    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Ocurrió un error.");
        setSubmitting(false);
        return;
      }

      clear();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      router.push(`/pedido/${data.orderId}`);
    } catch {
      setError("No pudimos conectar con el servidor. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  function handlePseSubmit(pseData: {
    financialInstitution: string;
    documentType: "CC" | "CE" | "NIT";
    documentNumber: string;
  }) {
    submitPayment({ paymentMethod: "PSE", ...pseData });
  }

  function handleCardSubmit(cardData: {
    token: string;
    installments: number;
    payment_method_id: string;
  }) {
    submitPayment({
      paymentMethod: "CARD",
      token: cardData.token,
      installments: cardData.installments,
      cardPaymentMethodId: cardData.payment_method_id,
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid md:grid-cols-[1fr_360px] gap-10">
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Finalizar compra</h1>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Nombre completo"
            value={personal.name}
            onChange={(v) => setPersonal((p) => ({ ...p, name: v }))}
            required
          />
          <Field
            label="Correo"
            type="email"
            value={personal.email}
            onChange={(v) => setPersonal((p) => ({ ...p, email: v }))}
            required
          />
          <Field
            label="Teléfono"
            value={personal.phone}
            onChange={(v) => setPersonal((p) => ({ ...p, phone: v }))}
            required
          />
          <Field
            label="Ciudad"
            value={personal.city}
            onChange={(v) => setPersonal((p) => ({ ...p, city: v }))}
            required
          />
        </div>
        <Field
          label="Dirección de envío"
          value={personal.address}
          onChange={(v) => setPersonal((p) => ({ ...p, address: v }))}
          required
        />

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            He leído y acepto los{" "}
            <Link href="/terminos-y-condiciones" target="_blank" className="text-brand hover:underline">
              Términos y Condiciones
            </Link>{" "}
            y autorizo el tratamiento de mis datos personales según la{" "}
            <Link href="/politica-de-tratamiento-de-datos" target="_blank" className="text-brand hover:underline">
              Política de Tratamiento de Datos
            </Link>
            .
          </span>
        </label>

        <div>
          <p className="text-sm font-medium mb-2">Método de pago</p>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setPayment(m.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  payment === m.key
                    ? "border-brand text-brand font-semibold"
                    : "border-border text-foreground/80"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <AnimatePresence mode="wait">
          {!personalComplete ? (
            <motion.p
              key="incomplete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted rounded-lg border border-dashed border-border p-4"
            >
              {!fieldsComplete
                ? "Completa tus datos de contacto y envío para continuar con el pago."
                : "Debes aceptar los Términos y Condiciones para continuar con el pago."}
            </motion.p>
          ) : (
            <motion.div
              key={payment}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {payment === "PSE" ? (
                <PseForm total={grandTotal} submitting={submitting} onSubmit={handlePseSubmit} />
              ) : (
                <CardForm total={grandTotal} onSubmit={handleCardSubmit} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="rounded-2xl border border-border p-5 h-fit space-y-4">
        <h2 className="font-semibold">Resumen del pedido</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.name} ({item.variantLabel}) x{item.quantity}
              </span>
              <span>{formatCOP(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div>
          {coupon ? (
            <div className="flex items-center justify-between rounded-lg bg-brand-light px-3 py-2 text-sm">
              <span className="text-brand font-medium">
                Cupón &quot;{coupon.code}&quot; aplicado
              </span>
              <button
                type="button"
                onClick={() => {
                  setCoupon(null);
                  setCouponInput("");
                }}
                className="text-muted hover:text-danger"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Código de descuento"
                className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyCoupon}
                disabled={checkingCoupon}
              >
                {checkingCoupon ? "..." : "Aplicar"}
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs text-danger mt-1">{couponError}</p>}
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span>{formatCOP(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Envío</span>
            <span>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Descuento</span>
              <span className="text-brand">-{formatCOP(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1">
            <span>Total</span>
            <span>{formatCOP(grandTotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="block font-medium mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}
