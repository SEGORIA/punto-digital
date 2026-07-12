# Guía de despliegue a producción

Checklist para lanzar Punto Digital en Vercel + Neon.

## 1. Base de datos (Neon)

1. Crea una cuenta en [neon.com](https://neon.com) y un proyecto nuevo.
2. Copia dos connection strings desde el dashboard de Neon:
   - **Pooled connection** (host termina en `-pooler`) → `DATABASE_URL`
   - **Direct connection** (sin `-pooler`) → `DIRECT_DATABASE_URL`
3. Guárdalas para el paso 4.

## 2. Almacenamiento de imágenes (Cloudflare R2 recomendado)

1. Crea un bucket en Cloudflare R2 (o AWS S3, o cualquier proveedor S3-compatible).
2. Genera credenciales API (Access Key ID / Secret) con permisos de lectura/escritura sobre ese bucket.
3. Activa acceso público al bucket (o configura un dominio custom / Public Development URL en R2) para que las imágenes sean accesibles desde el navegador.
4. Anota: `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`.
5. Una vez configurado, migra las imágenes actuales (hoy en `apps/web/public/products`) al bucket:
   ```
   pnpm --filter @punto-digital/db migrate:images
   ```
   Esto sube cada imagen y actualiza el campo `images` de cada producto en la base de datos con la nueva URL. Es seguro correrlo más de una vez (salta lo que ya esté migrado).

## 3. Mercado Pago

1. En [mercadopago.com.co/developers](https://www.mercadopago.com.co/developers/panel), obtén primero las **credenciales de prueba** (Access Token + Public Key) para validar todo el flujo sin dinero real.
2. Configura el webhook en el panel de Mercado Pago apuntando a: `https://TU-DOMINIO/api/webhooks/mercadopago`
3. Copia el secreto de firma del webhook → `MP_WEBHOOK_SECRET`.
4. Cuando todo esté probado, repite el proceso con las **credenciales de producción** y actualiza las variables de entorno en Vercel.

## 4. Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. **Root Directory**: `apps/web` (importante — es un monorepo).
3. **Build Command**: sobreescribe el default con `pnpm vercel-build` (corre las migraciones de Prisma antes de compilar).
4. Agrega todas las variables de entorno del `.env.example` en Project Settings → Environment Variables:
   - `DATABASE_URL`, `DIRECT_DATABASE_URL` (Neon)
   - `NEXTAUTH_SECRET` (genera uno nuevo con `openssl rand -base64 32`, no reutilices el de desarrollo)
   - `NEXTAUTH_URL` (tu dominio final, ej. `https://puntodigitalstore.com.co`)
   - `INTERNAL_API_KEY` (genera uno nuevo)
   - `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`
   - `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`
5. Despliega. Vercel corre `pnpm install` (dispara `postinstall` → genera el cliente Prisma) y luego `pnpm vercel-build` (aplica migraciones + build de Next.js).

## 5. Después del primer deploy

1. Corre el seed contra la base de datos de producción **una sola vez** (crea el usuario admin inicial):
   ```
   DATABASE_URL="<tu url de Neon>" pnpm --filter @punto-digital/db seed
   ```
   Cambia la contraseña del admin inmediatamente después de tu primer login.
2. Prueba el flujo completo en el dominio real: buscar producto → carrito → checkout con PSE y con tarjeta (modo prueba) → confirmar que el webhook actualiza el estado del pedido → verlo en `/admin/pedidos`.
3. Solo entonces, cambia `MP_ACCESS_TOKEN`/`NEXT_PUBLIC_MP_PUBLIC_KEY` a las credenciales de producción de Mercado Pago.

## 6. Corte de dominio

Recomendado: lanzar primero en el dominio temporal que asigna Vercel (`*.vercel.app`) o un subdominio de prueba, validar todo con una compra real de bajo monto, y solo después apuntar el dominio principal (`puntodigitalstore.com.co`) en Vercel → Domains, actualizando el DNS en el proveedor actual.

## Pendiente antes de recibir tráfico real (no técnico, pero importante)

- Página de **política de tratamiento de datos** y **términos y condiciones** (requerido por la Ley 1581 de 2012 en Colombia para cualquier e-commerce que recolecte datos personales).
- Decidir si se migran los pedidos/cupones restantes de WooCommerce que quedaron pendientes (ver conversación previa).
