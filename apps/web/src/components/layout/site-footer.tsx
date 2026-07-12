import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, BadgeDollarSign, Headphones } from "lucide-react";

const VALUE_PROPS = [
  { icon: Truck, title: "Envío a toda Colombia", text: "Gratis en compras sobre $100.000" },
  { icon: ShieldCheck, title: "Compra segura", text: "PSE y tarjetas con Mercado Pago" },
  { icon: BadgeDollarSign, title: "Precios directos", text: "Importador sin intermediarios" },
  { icon: Headphones, title: "Soporte real", text: "Atención por WhatsApp" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-start gap-2">
              <Icon size={22} className="text-brand" />
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-white/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm border-t border-white/10 pt-10">
          <div>
            <Image
              src="/brand/logo-punto.png"
              alt="Punto Digital"
              width={140}
              height={61}
              className="h-10 w-auto mb-3"
            />
            <p className="text-white/60">Accesorios tecnológicos importados directamente para Colombia.</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Enlaces</p>
            <ul className="space-y-1 text-white/60">
              <li><Link href="/tienda">Tienda</Link></li>
              <li><Link href="/nosotros">Nosotros</Link></li>
              <li><Link href="/puntos-aliados">Puntos Aliados</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Legal</p>
            <ul className="space-y-1 text-white/60">
              <li><Link href="/terminos-y-condiciones">Términos y Condiciones</Link></li>
              <li><Link href="/politica-de-tratamiento-de-datos">Tratamiento de Datos</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Síguenos</p>
            <ul className="space-y-1 text-white/60">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-white/40 mt-10">
          © {new Date().getFullYear()} Punto Digital Store. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
