import { NextRequest, NextResponse } from "next/server";

export function requireApiKey(req: NextRequest): NextResponse | null {
  const key = req.headers.get("x-api-key");
  if (!process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { error: "INTERNAL_API_KEY no está configurada en el servidor." },
      { status: 500 }
    );
  }
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}
