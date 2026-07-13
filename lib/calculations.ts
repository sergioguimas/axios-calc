export type PurchaseUnit = "KG" | "G" | "L" | "ML";

export function round(value: number, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateResinCostPerMl(input: {
  purchasePrice: number;
  purchaseUnit: PurchaseUnit | string;
  purchaseQuantity: number;
  density?: number | null;
}) {
  const { purchasePrice, purchaseUnit, purchaseQuantity, density } = input;
  if (purchasePrice < 0 || purchaseQuantity <= 0) return 0;

  let milliliters = 0;
  if (purchaseUnit === "KG") {
    if (!density || density <= 0) return 0;
    milliliters = (purchaseQuantity * 1000) / density;
  } else if (purchaseUnit === "G") {
    if (!density || density <= 0) return 0;
    milliliters = purchaseQuantity / density;
  } else if (purchaseUnit === "L") {
    milliliters = purchaseQuantity * 1000;
  } else if (purchaseUnit === "ML") {
    milliliters = purchaseQuantity;
  }

  return milliliters > 0 ? round(purchasePrice / milliliters, 6) : 0;
}

export function calculateFilamentCostPerGram(input: {
  purchasePrice: number;
  purchaseUnit: "KG" | "G" | string;
  purchaseQuantity: number;
}) {
  const { purchasePrice, purchaseUnit, purchaseQuantity } = input;
  if (purchasePrice < 0 || purchaseQuantity <= 0) return 0;

  let grams = 0;
  if (purchaseUnit === "KG") grams = purchaseQuantity * 1000;
  else if (purchaseUnit === "G") grams = purchaseQuantity;

  return grams > 0 ? round(purchasePrice / grams, 6) : 0;
}

export function timeToMinutes(hours: number, minutes: number) {
  return Math.max(0, Math.round(hours * 60 + minutes));
}

export function minutesToDecimalHours(minutes: number) {
  return Math.max(0, minutes) / 60;
}

export function calculateEnergyCost(powerWatts: number, printTimeMinutes: number, kwhCost: number) {
  if (powerWatts < 0 || printTimeMinutes < 0 || kwhCost < 0) return 0;
  return round((powerWatts / 1000) * minutesToDecimalHours(printTimeMinutes) * kwhCost);
}

export function calculateQuote(input: {
  materialCost: number;
  powerWatts: number;
  printTimeMinutes: number;
  kwhCost: number;
  finishCost: number;
  freightCost: number;
  quantity: number;
  pricingMode: "PERCENT" | "MANUAL" | string;
  profitPercent: number;
  manualFinalPrice: number;
}) {
  const materialCost = round(Math.max(0, input.materialCost));
  const energyCost = calculateEnergyCost(input.powerWatts, input.printTimeMinutes, input.kwhCost);
  const finishCost = round(Math.max(0, input.finishCost));
  const freightCost = round(Math.max(0, input.freightCost));
  const totalCost = round(materialCost + energyCost + finishCost + freightCost);
  const quantity = Math.max(1, Math.round(input.quantity));

  let profitPercent = Math.max(0, input.profitPercent);
  let finalPrice = round(totalCost * (1 + profitPercent / 100));

  if (input.pricingMode === "MANUAL") {
    finalPrice = round(Math.max(0, input.manualFinalPrice));
    profitPercent = totalCost > 0 ? round(((finalPrice - totalCost) / totalCost) * 100) : 0;
  }

  const profitValue = round(finalPrice - totalCost);

  return {
    materialCost,
    energyCost,
    finishCost,
    freightCost,
    totalCost,
    profitPercent,
    profitValue,
    finalPrice,
    unitCost: round(totalCost / quantity),
    unitPrice: round(finalPrice / quantity),
  };
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
}

export function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}min`;
}

export function parseLocaleNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return 0;
  const normalized = value.trim().replace(/\s/g, "").replace(/R\$/gi, "");
  if (normalized.includes(",")) {
    return Number(normalized.replace(/\./g, "").replace(",", "."));
  }
  return Number(normalized);
}
