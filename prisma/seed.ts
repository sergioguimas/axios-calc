import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateResinCostPerMl } from "../lib/calculations";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("@dmin", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      subscriptionEndsAt: null,
    },
  });

  await prisma.appSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      companyName: "Oficina 3D",
      kwhCost: 1.14,
      defaultProfitPercent: 100,
      currency: "BRL",
    },
  });

  await prisma.resin.upsert({
    where: { userId_name: { userId: admin.id, name: "Resina padrão" } },
    update: {},
    create: {
      userId: admin.id,
      name: "Resina padrão",
      purchasePrice: 150,
      purchaseUnit: "KG",
      purchaseQuantity: 1,
      density: 1.1,
      calculatedCostPerMl: calculateResinCostPerMl({
        purchasePrice: 150,
        purchaseUnit: "KG",
        purchaseQuantity: 1,
        density: 1.1,
      }),
      isActive: true,
    },
  });

  await prisma.printer.upsert({
    where: { userId_name: { userId: admin.id, name: "Impressora de resina padrão" } },
    update: {},
    create: {
      userId: admin.id,
      name: "Impressora de resina padrão",
      model: "LCD/MSLA",
      powerWatts: 120,
      isActive: true,
    },
  });

  for (const finish of [
    ["Sem pintura", 0],
    ["Pintura simples", 10],
    ["Pintura média", 25],
    ["Pintura detalhada", 50],
    ["Pintura premium", 100],
  ] as const) {
    await prisma.finishPreset.upsert({
      where: { userId_name: { userId: admin.id, name: finish[0] } },
      update: {},
      create: { userId: admin.id, name: finish[0], fixedCost: finish[1], isActive: true },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
