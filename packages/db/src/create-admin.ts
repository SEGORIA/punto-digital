/**
 * Crea (o actualiza la contraseña de) un usuario admin/bodega.
 * Pensado para correr contra la base de datos de producción.
 *
 * Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] [ADMIN_ROLE=ADMIN|EDITOR|WAREHOUSE] \
 *   pnpm --filter @punto-digital/db exec tsx src/create-admin.ts
 */
import bcrypt from "bcryptjs";
import { prisma } from "./index";

const VALID_ROLES = ["ADMIN", "EDITOR", "WAREHOUSE"] as const;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrador";
  const role = (process.env.ADMIN_ROLE || "ADMIN") as (typeof VALID_ROLES)[number];

  if (!email || !password) {
    throw new Error("Debes definir ADMIN_EMAIL y ADMIN_PASSWORD como variables de entorno.");
  }
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`ADMIN_ROLE inválido: ${role}. Usa uno de: ${VALID_ROLES.join(", ")}`);
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { password: hashed, role },
    create: { name, email, password: hashed, role },
  });

  console.log(`Usuario ${role} listo: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
