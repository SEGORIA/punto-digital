"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/utils";

type Bank = { id: string; description: string };

export function PseForm({
  total,
  submitting,
  onSubmit,
}: {
  total: number;
  submitting: boolean;
  onSubmit: (data: {
    financialInstitution: string;
    documentType: "CC" | "CE" | "NIT";
    documentNumber: string;
  }) => void;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [financialInstitution, setFinancialInstitution] = useState("");
  const [documentType, setDocumentType] = useState<"CC" | "CE" | "NIT">("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  useEffect(() => {
    fetch("/api/payments/pse-banks")
      .then((r) => r.json())
      .then((data) => setBanks(data.banks ?? []))
      .catch(() => setBanks([]))
      .finally(() => setLoadingBanks(false));
  }, []);

  return (
    <div className="space-y-4">
      <label className="text-sm block">
        <span className="block font-medium mb-1">Banco</span>
        <select
          value={financialInstitution}
          onChange={(e) => setFinancialInstitution(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
          disabled={loadingBanks}
        >
          <option value="">{loadingBanks ? "Cargando bancos..." : "Selecciona tu banco"}</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.description}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm block">
          <span className="block font-medium mb-1">Tipo de documento</span>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as "CC" | "CE" | "NIT")}
            className="w-full rounded-lg border border-border px-3 py-2"
          >
            <option value="CC">Cédula de ciudadanía</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="NIT">NIT</option>
          </select>
        </label>
        <label className="text-sm block">
          <span className="block font-medium mb-1">Número de documento</span>
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={submitting || !financialInstitution || !documentNumber}
        onClick={() => onSubmit({ financialInstitution, documentType, documentNumber })}
      >
        {submitting ? "Redirigiendo a tu banco..." : `Pagar ${formatCOP(total)} con PSE`}
      </Button>
    </div>
  );
}
