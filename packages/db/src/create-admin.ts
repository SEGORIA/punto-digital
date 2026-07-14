/**
 * Crea (o actualiza la contraseña de) el usuario administrador inicial.
 * Pensado para correr una sola vez contra la base de datos de producción.
 *
 * Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm --filter @punto-digital/db exec tsx src/create-admin.ts
 */
import bcrypt from "bcryptjs";
import { prisma } from "./index";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Debes definir ADMIN_EMAIL y ADMIN_PASSWORD como variables de entorno.");
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { password: hashed, role: "ADMIN" },
    create: { name: "Administrador", email, password: hashed, role: "ADMIN" },
  });

  console.log(`Usuario admin listo: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
