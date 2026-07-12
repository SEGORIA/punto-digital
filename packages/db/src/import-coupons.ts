import { prisma } from "./index";
import wcCoupons from "../data/wc-coupons.json";

async function main() {
  let created = 0;

  for (const c of wcCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        discountType: c.discount_type === "percent" ? "PERCENT" : "FIXED",
        amount: Math.round(Number(c.amount)),
        active: true,
      },
    });
    created++;
  }

  console.log(`Cupones migrados: ${created}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
