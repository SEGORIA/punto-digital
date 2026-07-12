# Punto Digital — Plataforma de E-commerce

Monorepo (pnpm + Turborepo) con la tienda pública, el panel de administración y la API interna para la futura integración con el sistema de gestión propio.

## Estructura

```
apps/web        -> Next.js (tienda pública + panel /admin + API)
packages/db     -> Prisma schema, cliente y seed
```

## Requisitos

- Node 20+
- pnpm (`npm install -g pnpm`)
- Una base de datos PostgreSQL (local vía Docker, o en la nube: Neon/Supabase tienen plan gratis)

## Puesta en marcha

1. Copia `.env.example` a `.env` en la raíz y en `apps/web/.env` (Next.js necesita el suyo propio) y completa `DATABASE_URL`, `NEXTAUTH_SECRET`, `INTERNAL_API_KEY`.

2. Instala dependencias:
   ```
   pnpm install
   ```

3. Levanta Postgres (opción local con Docker):
   ```
   docker run -d --name puntodigital-pg -e POSTGRES_USER=puntodigital -e POSTGRES_PASSWORD=puntodigital -e POSTGRES_DB=puntodigital -p 5432:5432 postgres:16-alpine
   ```
   O usa la URL de conexión que te dé Neon/Supabase directamente en `DATABASE_URL`.

4. Corre las migraciones y el seed:
   ```
   pnpm --filter @punto-digital/db migrate
   pnpm --filter @punto-digital/db seed
   ```
   El seed crea productos de ejemplo y un usuario admin:
   - Correo: `admin@puntodigitalstore.com.co`
   - Contraseña: `cambiar123` (cámbiala en producción)

5. Arranca todo:
   ```
   pnpm dev
   ```
   - Tienda: http://localhost:3000
   - Panel admin: http://localhost:3000/admin/login

## Verificación end-to-end sugerida

1. Buscar un producto en la tienda → añadir al carrito → checkout con PSE/Nequi/Tarjeta → ver confirmación de pedido.
2. Entrar al panel admin → ver el pedido en `/admin/pedidos` → cambiar su estado.
3. En `/admin/productos`, editar el stock de una variante y confirmar que se refleja en la tienda pública.
4. Probar la API interna (para el futuro ERP):
   ```
   curl -H "x-api-key: TU_INTERNAL_API_KEY" http://localhost:3000/api/v1/products
   ```

## Notas del estado actual

- Checkout con **Mercado Pago** (tarjeta + PSE) integrado end-to-end, incluyendo webhook de confirmación asíncrona. Falta solo cargar las credenciales de producción cuando el cliente las tenga (ver `DEPLOY.md`).
- Subida de imágenes con almacenamiento S3-compatible (Cloudflare R2/AWS S3); si no hay credenciales configuradas, cae en filesystem local (solo para desarrollo).
- `INTERNAL_API_KEY` protege la API v1 con una sola clave compartida; si el futuro ERP necesita más granularidad, se puede migrar a claves por cliente o OAuth2 client-credentials.

## Despliegue a producción

Ver [DEPLOY.md](DEPLOY.md) para la guía completa (Vercel + Neon + Cloudflare R2 + Mercado Pago).
