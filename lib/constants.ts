export const QUOTE_STATUSES = [
  { value: "QUOTE", label: "Orçamento" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "PRODUCED", label: "Produzido" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "ARCHIVED", label: "Arquivado" },
] as const;

export const STATUS_LABELS = Object.fromEntries(
  QUOTE_STATUSES.map((status) => [status.value, status.label]),
) as Record<string, string>;

export const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  L: "litro",
  ML: "ml",
};
