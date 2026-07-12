import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { AdminSignOutButton } from "@/components/admin/sign-out-button";
import { LayoutDashboard, Package, ShoppingBag, Tags, Ticket } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <AuthSessionProvider>{children}</AuthSessionProvider>;
  }

  return (
    <AuthSessionProvider>
      <div className="min-h-screen grid grid-cols-[220px_1fr] bg-muted-bg">
        <aside className="border-r border-border bg-background p-5 flex flex-col">
          <p className="font-bold text-brand mb-8">Punto Digital · Admin</p>
          <nav className="space-y-1 flex-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted-bg"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <AdminSignOutButton />
        </aside>
        <main className="p-8">{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
