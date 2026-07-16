"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { PackageCheck, PackageX, ScanBarcode } from "lucide-react";
import { lookupByCode, receiveStock, type ScannedVariant } from "@/app/admin/bodega/actions";

type HistoryEntry = {
  productName: string;
  label: string;
  sku: string;
  quantity: number;
  newStock: number;
  at: string;
};

export function BarcodeScanner() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScannedVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isPending, startTransition] = useTransition();

  const codeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  function focusCodeInput() {
    requestAnimationFrame(() => codeInputRef.current?.focus());
  }

  function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;

    setNotFound(null);
    startTransition(async () => {
      const found = await lookupByCode(value);
      if (!found) {
        setResult(null);
        setNotFound(value);
        setCode("");
        focusCodeInput();
        return;
      }
      setResult(found);
      setQuantity(1);
      setCode("");
      requestAnimationFrame(() => quantityInputRef.current?.focus());
    });
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!result || quantity <= 0) return;

    const current = result;
    startTransition(async () => {
      const { newStock } = await receiveStock(current.variantId, quantity);
      setHistory((prev) => [
        {
          productName: current.productName,
          label: current.label,
          sku: current.sku,
          quantity,
          newStock,
          at: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ].slice(0, 8));
      setResult(null);
      setQuantity(1);
      focusCodeInput();
    });
  }

  function cancelResult() {
    setResult(null);
    setNotFound(null);
    focusCodeInput();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <ScanBarcode size={20} />
          <h1 className="text-lg font-bold text-foreground">Ingreso de mercancía</h1>
        </div>
        <p className="text-sm text-muted">
          Escanea el código de barras del producto (o digítalo y presiona Enter) para registrar la
          cantidad que llegó a bodega.
        </p>

        {!result && (
          <form onSubmit={handleScanSubmit}>
            <input
              ref={codeInputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Escanea o escribe el código..."
              autoComplete="off"
              disabled={isPending}
              className="w-full rounded-xl border-2 border-border px-4 py-4 text-lg font-mono outline-none focus:border-brand"
            />
          </form>
        )}

        {notFound && (
          <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            <PackageX size={18} />
            <span>
              Código <span className="font-mono font-semibold">{notFound}</span> no encontrado. Pide a
              un administrador que lo asigne al producto correcto.
            </span>
          </div>
        )}

        {result && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-border p-4">
              {result.image ? (
                <Image
                  src={result.image}
                  alt={result.productName}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted-bg" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{result.productName}</p>
                <p className="text-sm text-muted">
                  {result.label} · SKU {result.sku}
                </p>
                <p className="text-sm text-muted">Stock actual: {result.stock}</p>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <label className="text-sm block flex-1">
                <span className="block font-medium mb-1">Cantidad recibida</span>
                <input
                  ref={quantityInputRef}
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-border px-3 py-3 text-lg"
                />
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                <PackageCheck size={18} />
                Confirmar
              </button>
              <button
                type="button"
                onClick={cancelResult}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <h2 className="mb-3 font-semibold">Últimos ingresos de esta sesión</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2">Hora</th>
                <th className="py-2">Producto</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Stock nuevo</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 text-muted">{h.at}</td>
                  <td className="py-2">
                    {h.productName} <span className="text-muted">· {h.label}</span>
                  </td>
                  <td className="py-2 font-mono text-xs">{h.sku}</td>
                  <td className="py-2 font-semibold text-success">+{h.quantity}</td>
                  <td className="py-2">{h.newStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
