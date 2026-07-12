import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

function isS3Configured() {
  return Boolean(
    process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET
  );
}

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Sube un archivo al bucket S3-compatible configurado (Cloudflare R2, AWS S3, etc.).
 * Si no hay credenciales configuradas, guarda en el filesystem local de `public/uploads`
 * — cómodo para desarrollo, pero no persiste en hosting serverless (Vercel, etc.).
 */
export async function uploadFile(filename: string, contentType: string, bytes: Buffer): Promise<string> {
  if (isS3Configured()) {
    const client = getS3Client();
    const key = `uploads/${filename}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      })
    );

    const publicBase = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
    return `${publicBase}/${process.env.S3_BUCKET}/${key}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (isS3Configured() && url.includes(process.env.S3_BUCKET!)) {
    const client = getS3Client();
    const key = url.split(`${process.env.S3_BUCKET}/`)[1];
    if (key) {
      await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    await unlink(filePath).catch(() => {});
  }
}

export { isS3Configured };
