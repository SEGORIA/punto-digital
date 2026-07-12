import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado. Usa JPG, PNG, WebP o AVIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen no puede superar 5MB." }, { status: 400 });
  }

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const url = await uploadFile(filename, file.type, bytes);

  return NextResponse.json({ url }, { status: 201 });
}
