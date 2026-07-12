import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de compra en Punto Digital Store.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Términos y Condiciones</h1>
        <p className="text-sm text-muted mt-2">Última actualización: {new Date().toLocaleDateString("es-CO")}</p>
      </div>

      <Section title="1. Identificación del comercio">
        <p>
          Punto Digital Store (en adelante, &quot;Punto Digital&quot;, &quot;nosotros&quot;) es una tienda en línea
          dedicada a la comercialización de accesorios tecnológicos, con envíos a todo el territorio
          colombiano. Al realizar una compra o navegar en este sitio, usted acepta los presentes
          Términos y Condiciones.
        </p>
      </Section>

      <Section title="2. Aceptación de los términos">
        <p>
          El uso de este sitio web y la realización de compras a través de él implican la aceptación
          plena de estos términos. Si no está de acuerdo con alguna condición aquí establecida, le
          recomendamos abstenerse de usar el sitio o realizar compras.
        </p>
      </Section>

      <Section title="3. Productos y precios">
        <p>
          Los precios publicados están expresados en pesos colombianos (COP) e incluyen los impuestos
          aplicables, salvo que se indique lo contrario. Punto Digital se reserva el derecho de
          modificar precios, descripciones y disponibilidad de productos sin previo aviso, sin que
          esto afecte los pedidos ya confirmados y pagados.
        </p>
        <p>
          Realizamos nuestros mejores esfuerzos para que las imágenes y descripciones reflejen
          fielmente el producto; sin embargo, pueden existir variaciones menores respecto al producto
          físico (color, empaque) que no constituyen incumplimiento.
        </p>
      </Section>

      <Section title="4. Proceso de compra y medios de pago">
        <p>
          Las compras se procesan a través de la pasarela de pagos Mercado Pago, que admite pago por
          PSE (débito a cuentas bancarias colombianas) y tarjeta de crédito/débito. Punto Digital no
          almacena en sus servidores los datos completos de tarjetas de pago; estos son procesados
          directamente por Mercado Pago bajo sus propios estándares de seguridad (PCI-DSS).
        </p>
        <p>
          Un pedido se considera confirmado únicamente cuando el pago ha sido aprobado. En caso de
          rechazo o falla del pago, el pedido se cancela automáticamente y no se realiza ningún cobro.
        </p>
      </Section>

      <Section title="5. Envíos">
        <p>
          Realizamos envíos a todo el territorio colombiano a través de transportadoras aliadas. Los
          tiempos de entrega son estimados y pueden variar según la ciudad de destino y la
          transportadora. El costo de envío se calcula y muestra antes de finalizar la compra; las
          compras que superen el monto mínimo indicado en el sitio tienen envío gratuito.
        </p>
      </Section>

      <Section title="6. Derecho de retracto">
        <p>
          De acuerdo con el artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), el
          consumidor tiene derecho a retractarse de la compra dentro de los cinco (5) días hábiles
          siguientes a la entrega del producto, sin necesidad de justificar su decisión, siempre que
          el producto se encuentre sin uso, con su empaque original y accesorios completos.
        </p>
        <p>
          Para ejercer este derecho, el cliente debe contactarnos por WhatsApp o correo electrónico
          indicando el número de pedido. Los costos de devolución del producto corren por cuenta del
          consumidor, salvo que la devolución se deba a un error nuestro o a un producto defectuoso.
        </p>
      </Section>

      <Section title="7. Garantía legal">
        <p>
          Todos los productos cuentan con la garantía legal mínima establecida en la Ley 1480 de 2011,
          cuya duración depende del tipo de producto y se informa en la ficha de cada artículo o, en
          su defecto, corresponde a la garantía legal supletoria. Ante cualquier defecto de fabricación,
          contáctenos para gestionar la reparación, cambio o devolución según corresponda.
        </p>
      </Section>

      <Section title="8. Propiedad intelectual">
        <p>
          Todo el contenido de este sitio (textos, imágenes, logotipos, diseño) es propiedad de Punto
          Digital o de sus proveedores y está protegido por las leyes de propiedad intelectual
          aplicables. Queda prohibida su reproducción total o parcial sin autorización previa.
        </p>
      </Section>

      <Section title="9. Limitación de responsabilidad">
        <p>
          Punto Digital no será responsable por retrasos o incumplimientos derivados de causas de
          fuerza mayor, caso fortuito, o hechos de terceros (como fallas de las transportadoras o de
          la pasarela de pagos) que estén fuera de su control razonable.
        </p>
      </Section>

      <Section title="10. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia
          derivada de su interpretación o aplicación será sometida a las autoridades judiciales o
          administrativas competentes en Colombia, incluyendo la Superintendencia de Industria y
          Comercio (SIC) para asuntos de protección al consumidor.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Para preguntas, reclamos o para ejercer el derecho de retracto, puede contactarnos a través
          de WhatsApp o los canales indicados en nuestras páginas de contacto.
        </p>
      </Section>

      <p className="text-xs text-muted pt-4 border-t border-border">
        Este documento es una guía general y no constituye asesoría legal. Se recomienda su revisión
        por un abogado antes de su publicación definitiva, para ajustarlo a las condiciones
        particulares del negocio.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm text-muted leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
