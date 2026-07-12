/**
 * Sube las imágenes de producto que hoy viven en apps/web/public/products (y
 * cualquier archivo en public/uploads) a un bucket S3-compatible, y actualiza
 * el campo `images` de cada Product con la nueva URL pública.
 *
 * Necesario antes de desplegar en hosting serverless (Vercel, etc.): el
 * filesystem local no persiste entre despliegues/instancias, así que las
 * imágenes de producto se perderían si se quedan en public/products.
 *
 * Requiere las variables S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 * S3_BUCKET (y opcionalmente S3_REGION, S3_PUBLIC_URL) configuradas en .env.
 *
 * Uso: pnpm --filter @punto-digital/db migrate:images
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { prisma } from "./index";

const PUBLIC_DIR = path.resolve(__dirname, "../../../apps/web/public");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Configura el bucket antes de migrar.`);
  }
  return value;
}

function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

async function main() {
  const endpoint = requireEnv("S3_ENDPOINT");
  const accessKeyId = requireEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("S3_SECRET_ACCESS_KEY");
  const bucket = requireEnv("S3_BUCKET");
  const publicBase = process.env.S3_PUBLIC_URL || endpoint;

  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const products = await prisma.product.findMany({
    where: { images: { isEmpty: false } },
  });

  let uploaded = 0;
  let skippedAlreadyMigrated = 0;
  let skippedMissingFile = 0;

  for (const product of products) {
    const newImages: string[] = [];
    let changed = false;

    for (const imagePath of product.images) {
      if (!imagePath.startsWith("/products/") && !imagePath.startsWith("/uploads/")) {
        // Ya es una URL externa (probablemente ya migrada, o un logo estático).
        newImages.push(imagePath);
        skippedAlreadyMigrated++;
        continue;
      }

      const localFile = path.join(PUBLIC_DIR, imagePath);
      if (!fs.existsSync(localFile)) {
        console.warn(`  ⚠ No existe en disco: ${imagePath} (producto ${product.slug})`);
        newImages.push(imagePath);
        skippedMissingFile++;
        continue;
      }

      const filename = path.basename(imagePath);
      const key = `products/${filename}`;
      const bytes = fs.readFileSync(localFile);

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentTypeFor(filename),
        })
      );

      const newUrl = `${publicBase}/${bucket}/${key}`;
      newImages.push(newUrl);
      changed = true;
      uploaded++;
      process.stdout.write(".");
    }

    if (changed) {
      await prisma.product.update({ where: { id: product.id }, data: { images: newImages } });
    }
  }

  console.log(
    `\nMigración completa. Subidas: ${uploaded}. Ya migradas/externas: ${skippedAlreadyMigrated}. Archivos faltantes: ${skippedMissingFile}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
