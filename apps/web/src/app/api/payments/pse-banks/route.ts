import { NextResponse } from "next/server";
import { getPseBanks } from "@/lib/mercadopago";

export async function GET() {
  try {
    const banks = await getPseBanks();
    return NextResponse.json({ banks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo obtener la lista de bancos." }, { status: 500 });
  }
}
