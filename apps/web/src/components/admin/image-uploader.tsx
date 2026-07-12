"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageUploader({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium mb-1">Imagen del producto</span>
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center gap-4 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
          dragOver ? "border-brand bg-brand-light" : "border-border"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />

        {url ? (
          <div className="relative h-20 w-20 shrink-0 rounded-md bg-muted-bg overflow-hidden">
            <Image src={url} alt="Vista previa" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted-bg text-muted">
            <UploadCloud size={24} />
          </div>
        )}

        <div className="flex-1 text-sm text-muted">
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Subiendo...
            </span>
          ) : (
            <>
              Arrastra una imagen aquí o haz clic para elegirla
              <br />
              <span className="text-xs">JPG, PNG, WebP o AVIF. Máximo 5MB.</span>
            </>
          )}
        </div>

        {url && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUrl("");
            }}
            className="text-danger shrink-0"
            aria-label="Quitar imagen"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
