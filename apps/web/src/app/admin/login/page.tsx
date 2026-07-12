"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Panel Punto Digital</h1>
        <label className="text-sm block">
          <span className="block font-medium mb-1">Correo</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm block">
          <span className="block font-medium mb-1">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
