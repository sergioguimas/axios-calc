"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateQuote, calculateResinCostPerMl, parseLocaleNumber, timeToMinutes } from "@/lib/calculations";
import { finishSchema, printerSchema, quoteSchema, resinSchema, settingsSchema } from "@/lib/validation";

export type QuoteActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || undefined;
}

function idFrom(formData: FormData, key = "id") {
  return Math.trunc(parseLocaleNumber(formData.get(key)));
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  return raw === "" ? undefined : parseLocaleNumber(formData.get(key));
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação.";
}

async function persistQuote(id: number | null, _previousState: QuoteActionState, formData: FormData): Promise<QuoteActionState> {
  const candidate = {
    modelName: text(formData, "modelName"),
    customerName: optionalText(formData, "customerName"),
    description: optionalText(formData, "description"),
    quantity: idFrom(formData, "quantity"),
    status: text(formData, "status") || "QUOTE",
    driveLink: optionalText(formData, "driveLink") ?? "",
    notes: optionalText(formData, "notes"),
    freightNotes: optionalText(formData, "freightNotes"),
    heightMm: parseLocaleNumber(formData.get("heightMm")),
    widthMm: parseLocaleNumber(formData.get("widthMm")),
    depthMm: parseLocaleNumber(formData.get("depthMm")),
    resinMl: parseLocaleNumber(formData.get("resinMl")),
    printHours: parseLocaleNumber(formData.get("printHours")),
    printMinutes: parseLocaleNumber(formData.get("printMinutes")),
    resinId: idFrom(formData, "resinId"),
    printerId: idFrom(formData, "printerId"),
    finishPresetId: idFrom(formData, "finishPresetId"),
    freightCost: parseLocaleNumber(formData.get("freightCost")),
    pricingMode: text(formData, "pricingMode") || "PERCENT",
    profitPercent: parseLocaleNumber(formData.get("profitPercent")),
    manualFinalPrice: parseLocaleNumber(formData.get("manualFinalPrice")),
  };

  const parsed = quoteSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const [settings, resin, printer, finish] = await Promise.all([
    prisma.appSettings.findUnique({ where: { id: 1 } }),
    prisma.resin.findUnique({ where: { id: input.resinId } }),
    prisma.printer.findUnique({ where: { id: input.printerId } }),
    prisma.finishPreset.findUnique({ where: { id: input.finishPresetId } }),
  ]);

  if (!settings || !resin || !printer || !finish) {
    return { error: "Um dos cadastros selecionados não existe mais. Atualize a página e selecione novamente." };
  }

  const printTimeMinutes = timeToMinutes(input.printHours, input.printMinutes);
  const resinCostPerMl = resin.manualCostPerMl ?? resin.calculatedCostPerMl;
  const totals = calculateQuote({
    resinMl: input.resinMl,
    resinCostPerMl,
    powerWatts: printer.powerWatts,
    printTimeMinutes,
    kwhCost: settings.kwhCost,
    finishCost: finish.fixedCost,
    freightCost: input.freightCost,
    quantity: input.quantity,
    pricingMode: input.pricingMode,
    profitPercent: input.profitPercent,
    manualFinalPrice: input.manualFinalPrice,
  });

  if (input.pricingMode === "MANUAL" && totals.totalCost === 0) {
    return { error: "O custo total está zerado. Informe os custos antes de calcular a margem pelo preço final." };
  }

  const data = {
    modelName: input.modelName,
    customerName: input.customerName || null,
    description: input.description || null,
    quantity: input.quantity,
    status: input.status,
    materialType: "RESIN",
    driveLink: input.driveLink || null,
    notes: input.notes || null,
    freightNotes: input.freightNotes || null,
    heightMm: input.heightMm,
    widthMm: input.widthMm,
    depthMm: input.depthMm,
    resinMl: input.resinMl,
    printTimeMinutes,
    resinId: resin.id,
    resinNameSnapshot: resin.name,
    resinCostPerMlSnapshot: resinCostPerMl,
    printerId: printer.id,
    printerNameSnapshot: printer.name,
    printerPowerWattsSnapshot: printer.powerWatts,
    finishPresetId: finish.id,
    finishNameSnapshot: finish.name,
    finishCostSnapshot: finish.fixedCost,
    ...totals,
    pricingMode: input.pricingMode,
  };

  let quote: { id: number };
  try {
    quote = id
      ? await prisma.quote.update({ where: { id }, data, select: { id: true } })
      : await prisma.quote.create({ data, select: { id: true } });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath("/");
  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quote.id}`);
}

export async function createQuoteAction(previousState: QuoteActionState, formData: FormData) {
  return persistQuote(null, previousState, formData);
}

export async function updateQuoteAction(id: number, previousState: QuoteActionState, formData: FormData) {
  return persistQuote(id, previousState, formData);
}

export async function duplicateQuoteAction(formData: FormData) {
  const id = idFrom(formData);
  const source = await prisma.quote.findUnique({ where: { id } });
  if (!source) redirect("/orcamentos?error=Orçamento não encontrado");

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = source;
  const quote = await prisma.quote.create({
    data: { ...copy, status: "QUOTE", modelName: `${source.modelName} (cópia)` },
  });
  revalidatePath("/");
  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quote.id}/editar`);
}

export async function deleteQuoteAction(formData: FormData) {
  const id = idFrom(formData);
  if (id > 0) await prisma.quote.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/orcamentos");
  redirect("/orcamentos?deleted=1");
}

export async function updateQuoteStatusAction(formData: FormData) {
  const id = idFrom(formData);
  const status = text(formData, "status");
  if (!["QUOTE", "APPROVED", "PRODUCED", "CANCELED", "ARCHIVED"].includes(status)) return;
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
}

export async function updateSettingsAction(formData: FormData) {
  const parsed = settingsSchema.safeParse({
    companyName: optionalText(formData, "companyName"),
    kwhCost: parseLocaleNumber(formData.get("kwhCost")),
    defaultProfitPercent: parseLocaleNumber(formData.get("defaultProfitPercent")),
    currency: "BRL",
    notes: optionalText(formData, "notes"),
  });
  if (!parsed.success) redirect("/configuracoes?tab=geral&error=Revise os valores informados");
  await prisma.appSettings.upsert({ where: { id: 1 }, create: { id: 1, ...parsed.data }, update: parsed.data });
  revalidatePath("/");
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=geral&saved=1");
}

export async function upsertResinAction(formData: FormData) {
  const id = idFrom(formData);
  const parsed = resinSchema.safeParse({
    name: text(formData, "name"),
    manufacturer: optionalText(formData, "manufacturer"),
    color: optionalText(formData, "color"),
    purchasePrice: parseLocaleNumber(formData.get("purchasePrice")),
    purchaseUnit: text(formData, "purchaseUnit"),
    purchaseQuantity: parseLocaleNumber(formData.get("purchaseQuantity")),
    density: optionalNumber(formData, "density"),
    manualCostPerMl: optionalNumber(formData, "manualCostPerMl"),
    notes: optionalText(formData, "notes"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) redirect("/configuracoes?tab=resinas&error=Revise os dados da resina");
  const calculatedCostPerMl = calculateResinCostPerMl(parsed.data);
  const data = { ...parsed.data, density: parsed.data.density ?? null, manualCostPerMl: parsed.data.manualCostPerMl ?? null, calculatedCostPerMl };
  try {
    if (id > 0) await prisma.resin.update({ where: { id }, data });
    else await prisma.resin.create({ data });
  } catch {
    redirect("/configuracoes?tab=resinas&error=Já existe uma resina com esse nome");
  }
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=resinas&saved=1");
}

export async function toggleResinAction(formData: FormData) {
  const id = idFrom(formData);
  const current = await prisma.resin.findUnique({ where: { id }, select: { isActive: true } });
  if (current) await prisma.resin.update({ where: { id }, data: { isActive: !current.isActive } });
  revalidatePath("/configuracoes");
}

export async function deleteResinAction(formData: FormData) {
  const id = idFrom(formData);
  const inUse = await prisma.quote.count({ where: { resinId: id } });
  if (inUse > 0) redirect("/configuracoes?tab=resinas&error=Esta resina está vinculada a orçamentos e não pode ser excluída");
  await prisma.resin.delete({ where: { id } });
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=resinas&deleted=1");
}

export async function upsertPrinterAction(formData: FormData) {
  const id = idFrom(formData);
  const parsed = printerSchema.safeParse({
    name: text(formData, "name"),
    model: optionalText(formData, "model"),
    powerWatts: parseLocaleNumber(formData.get("powerWatts")),
    notes: optionalText(formData, "notes"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) redirect("/configuracoes?tab=impressoras&error=Revise os dados da impressora");
  try {
    if (id > 0) await prisma.printer.update({ where: { id }, data: parsed.data });
    else await prisma.printer.create({ data: parsed.data });
  } catch {
    redirect("/configuracoes?tab=impressoras&error=Já existe uma impressora com esse nome");
  }
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=impressoras&saved=1");
}

export async function togglePrinterAction(formData: FormData) {
  const id = idFrom(formData);
  const current = await prisma.printer.findUnique({ where: { id }, select: { isActive: true } });
  if (current) await prisma.printer.update({ where: { id }, data: { isActive: !current.isActive } });
  revalidatePath("/configuracoes");
}

export async function deletePrinterAction(formData: FormData) {
  const id = idFrom(formData);
  if (await prisma.quote.count({ where: { printerId: id } })) {
    redirect("/configuracoes?tab=impressoras&error=Esta impressora está vinculada a orçamentos e não pode ser excluída");
  }
  await prisma.printer.delete({ where: { id } });
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=impressoras&deleted=1");
}

export async function upsertFinishAction(formData: FormData) {
  const id = idFrom(formData);
  const parsed = finishSchema.safeParse({
    name: text(formData, "name"),
    description: optionalText(formData, "description"),
    fixedCost: parseLocaleNumber(formData.get("fixedCost")),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) redirect("/configuracoes?tab=acabamentos&error=Revise os dados do acabamento");
  try {
    if (id > 0) await prisma.finishPreset.update({ where: { id }, data: parsed.data });
    else await prisma.finishPreset.create({ data: parsed.data });
  } catch {
    redirect("/configuracoes?tab=acabamentos&error=Já existe um acabamento com esse nome");
  }
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=acabamentos&saved=1");
}

export async function toggleFinishAction(formData: FormData) {
  const id = idFrom(formData);
  const current = await prisma.finishPreset.findUnique({ where: { id }, select: { isActive: true } });
  if (current) await prisma.finishPreset.update({ where: { id }, data: { isActive: !current.isActive } });
  revalidatePath("/configuracoes");
}

export async function deleteFinishAction(formData: FormData) {
  const id = idFrom(formData);
  if (await prisma.quote.count({ where: { finishPresetId: id } })) {
    redirect("/configuracoes?tab=acabamentos&error=Este acabamento está vinculado a orçamentos e não pode ser excluído");
  }
  await prisma.finishPreset.delete({ where: { id } });
  revalidatePath("/configuracoes");
  redirect("/configuracoes?tab=acabamentos&deleted=1");
}
