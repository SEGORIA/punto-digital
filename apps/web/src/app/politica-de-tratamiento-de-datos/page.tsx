import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales",
  description: "Política de tratamiento de datos personales de Punto Digital Store.",
};

export default function PoliticaDatosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Política de Tratamiento de Datos Personales</h1>
        <p className="text-sm text-muted mt-2">Última actualización: {new Date().toLocaleDateString("es-CO")}</p>
      </div>

      <Section title="1. Responsable del tratamiento">
        <p>
          Punto Digital Store (en adelante, &quot;Punto Digital&quot;) es responsable del tratamiento
          de los datos personales que usted nos suministra al navegar en este sitio, crear un pedido,
          o contactarnos por nuestros canales de atención.
        </p>
      </Section>

      <Section title="2. Marco legal">
        <p>
          Esta política se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y
          demás normas que las modifiquen o complementen, que regulan la protección de datos
          personales en Colombia.
        </p>
      </Section>

      <Section title="3. Datos que recolectamos">
        <p>Al realizar una compra o contactarnos, podemos recolectar:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nombre completo</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono</li>
          <li>Dirección de envío y ciudad</li>
          <li>Historial de compras y productos adquiridos</li>
        </ul>
        <p>
          No almacenamos números completos de tarjetas de crédito/débito ni códigos de seguridad:
          estos son procesados directamente por nuestra pasarela de pagos (Mercado Pago).
        </p>
      </Section>

      <Section title="4. Finalidad del tratamiento">
        <p>Los datos personales recolectados se utilizan para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Procesar y hacer seguimiento a sus pedidos (confirmación, envío, entrega).</li>
          <li>Contactarlo ante cualquier novedad relacionada con su compra.</li>
          <li>Atender solicitudes, quejas o reclamos.</li>
          <li>Cumplir con obligaciones legales y contables.</li>
          <li>
            Enviar comunicaciones comerciales o promocionales, únicamente si usted ha autorizado
            expresamente este uso.
          </li>
        </ul>
      </Section>

      <Section title="5. Derechos del titular">
        <p>Como titular de los datos, usted tiene derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.</li>
          <li>Ser informado sobre el uso que se ha dado a sus datos personales.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones
            a la normativa de protección de datos.
          </li>
          <li>
            Revocar la autorización y/o solicitar la supresión de sus datos, cuando no exista un deber
            legal o contractual que obligue a conservarlos.
          </li>
          <li>Acceder de forma gratuita a sus datos personales que hayan sido objeto de tratamiento.</li>
        </ul>
      </Section>

      <Section title="6. Cómo ejercer sus derechos">
        <p>
          Para ejercer cualquiera de estos derechos, puede escribirnos a través de WhatsApp o correo
          electrónico indicando su nombre completo, el derecho que desea ejercer y una descripción
          clara de su solicitud. Responderemos dentro de los plazos establecidos por la ley (10 días
          hábiles para consultas, 15 días hábiles para reclamos).
        </p>
      </Section>

      <Section title="7. Con quién compartimos sus datos">
        <p>Sus datos pueden ser compartidos con terceros estrictamente necesarios para la operación:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mercado Pago, para procesar el pago de su pedido.</li>
          <li>Empresas transportadoras, para la entrega de su pedido.</li>
        </ul>
        <p>No vendemos ni cedemos sus datos personales a terceros con fines comerciales ajenos a la operación de la tienda.</p>
      </Section>

      <Section title="8. Seguridad de la información">
        <p>
          Punto Digital adopta medidas técnicas y administrativas razonables para proteger sus datos
          personales contra pérdida, uso indebido, acceso no autorizado o divulgación.
        </p>
      </Section>

      <Section title="9. Vigencia">
        <p>
          Esta política rige a partir de su fecha de publicación. Sus datos personales se conservarán
          durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales
          aplicables (incluyendo las contables y tributarias).
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
