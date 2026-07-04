import { z } from "zod";

const nonNegative = z.number().finite().min(0, "Informe um valor igual ou maior que zero.");

export const quoteSchema = z.object({
  modelName: z.string().trim().min(2, "Informe o nome do modelo."),
  customerName: z.string().trim().optional(),
  description: z.string().trim().optional(),
  quantity: z.number().int().min(1, "A quantidade deve ser maior que zero."),
  status: z.enum(["QUOTE", "APPROVED", "PRODUCED", "CANCELED", "ARCHIVED"]),
  driveLink: z.union([z.literal(""), z.string().url("Informe uma URL válida.")]).optional(),
  notes: z.string().trim().optional(),
  freightNotes: z.string().trim().optional(),
  heightMm: nonNegative,
  widthMm: nonNegative,
  depthMm: nonNegative,
  resinMl: nonNegative,
  printHours: nonNegative,
  printMinutes: z.number().finite().min(0).max(59, "Use de 0 a 59 minutos."),
  resinId: z.number().int().positive("Selecione uma resina."),
  printerId: z.number().int().positive("Selecione uma impressora."),
  finishPresetId: z.number().int().positive("Selecione um acabamento."),
  freightCost: nonNegative,
  pricingMode: z.enum(["PERCENT", "MANUAL"]),
  profitPercent: nonNegative,
  manualFinalPrice: nonNegative,
});

export const settingsSchema = z.object({
  companyName: z.string().trim().optional(),
  kwhCost: nonNegative,
  defaultProfitPercent: nonNegative,
  currency: z.literal("BRL"),
  notes: z.string().trim().optional(),
});

export const resinSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome da resina."),
    manufacturer: z.string().trim().optional(),
    color: z.string().trim().optional(),
    purchasePrice: nonNegative,
    purchaseUnit: z.enum(["KG", "G", "L", "ML"]),
    purchaseQuantity: z.number().finite().positive("A quantidade deve ser maior que zero."),
    density: z.number().finite().optional(),
    manualCostPerMl: z.number().finite().optional(),
    notes: z.string().trim().optional(),
    isActive: z.boolean(),
  })
  .superRefine((value, context) => {
    if (["KG", "G"].includes(value.purchaseUnit) && (!value.density || value.density <= 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["density"], message: "A densidade deve ser maior que zero para compras por peso." });
    }
    if (value.manualCostPerMl !== undefined && value.manualCostPerMl < 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["manualCostPerMl"], message: "O custo manual não pode ser negativo." });
    }
  });

export const printerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da impressora."),
  model: z.string().trim().optional(),
  powerWatts: nonNegative,
  notes: z.string().trim().optional(),
  isActive: z.boolean(),
});

export const finishSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do acabamento."),
  description: z.string().trim().optional(),
  fixedCost: nonNegative,
  isActive: z.boolean(),
});
