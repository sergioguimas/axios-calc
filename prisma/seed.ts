import { PrismaClient } from "@prisma/client";
import { calculateResinCostPerMl } from "../lib/calculations";

const prisma = new PrismaClient();

async function main() {
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "Oficina 3D",
      kwhCost: 1.14,
      defaultProfitPercent: 100,
      currency: "BRL",
    },
  });

  await prisma.resin.upsert({
    where: { name: "Resina padrão" },
    update: {},
    create: {
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
    where: { name: "Impressora de resina padrão" },
    update: {},
    create: {
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
      where: { name: finish[0] },
      update: {},
      create: { name: finish[0], fixedCost: finish[1], isActive: true },
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
