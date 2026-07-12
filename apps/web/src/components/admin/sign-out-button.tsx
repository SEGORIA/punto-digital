"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminSignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-muted-bg"
    >
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}
