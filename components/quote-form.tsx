"use client";

import { useMemo, useActionState, useRef, useState } from "react";
import {
  TbBox,
  TbCheck,
  TbCoin,
  TbInfoCircle,
  TbPackage,
  TbPaint,
  TbPrinter,
  TbRefresh,
  TbRulerMeasure,
  TbTruckDelivery,
  TbUser,
} from "react-icons/tb";
import type { QuoteActionState } from "@/app/actions";
import { calculateQuote, formatCurrency, formatDuration } from "@/lib/calculations";
import { MATERIAL_TYPE_LABELS, QUOTE_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OptionBase = { id: number; name: string };
type ResinOption = OptionBase & { calculatedCostPerMl: number; manualCostPerMl: number | null };
type FilamentOption = OptionBase & { calculatedCostPerGram: number; manualCostPerGram: number | null };
type PrinterOption = OptionBase & { powerWatts: number; model: string | null; type: string };
type FinishOption = OptionBase & { fixedCost: number; description: string | null };

export type QuoteFormValue = {
  modelName: string;
  customerName: string | null;
  description: string | null;
  quantity: number;
  status: string;
  materialType: string;
  driveLink: string | null;
  notes: string | null;
  freightNotes: string | null;
  heightMm: number;
  widthMm: number;
  depthMm: number;
  resinMl: number;
  filamentGrams: number;
  printTimeMinutes: number;
  resinId: number | null;
  filamentId: number | null;
  printerId: number | null;
  finishPresetId: number | null;
  freightCost: number;
  pricingMode: string;
  profitPercent: number;
  finalPrice: number;
};

type QuoteAction = (state: QuoteActionState, formData: FormData) => Promise<QuoteActionState>;

function FieldError({ errors, name }: { errors?: Record<string, string[]>; name: string }) {
  const message = errors?.[name]?.[0];
  return message ? <p className="mt-1 text-xs text-red-300">{message}</p> : null;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label>{children}</div>;
}

export function QuoteForm({
  action,
  settings,
  resins,
  filaments,
  printers,
  finishes,
  initial,
}: {
  action: QuoteAction;
  settings: { kwhCost: number; defaultProfitPercent: number; currency: string };
  resins: ResinOption[];
  filaments: FilamentOption[];
  printers: PrinterOption[];
  finishes: FinishOption[];
  initial?: QuoteFormValue;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  const hasResinSetup = resins.length > 0 && printers.some((printer) => printer.type === "RESIN");
  const hasFilamentSetup = filaments.length > 0 && printers.some((printer) => printer.type === "FILAMENT");

  const defaultMaterialType =
    initial?.materialType === "FILAMENT" && hasFilamentSetup
      ? "FILAMENT"
      : initial?.materialType === "RESIN" && hasResinSetup
        ? "RESIN"
        : hasResinSetup
          ? "RESIN"
          : "FILAMENT";

  const defaults = {
    quantity: initial?.quantity ?? 1,
    heightMm: initial?.heightMm ?? 0,
    widthMm: initial?.widthMm ?? 0,
    depthMm: initial?.depthMm ?? 0,
    resinMl: initial?.resinMl ?? 0,
    filamentGrams: initial?.filamentGrams ?? 0,
    hours: initial ? Math.floor(initial.printTimeMinutes / 60) : 0,
    minutes: initial ? initial.printTimeMinutes % 60 : 0,
    resinId: initial?.resinId ?? resins[0]?.id ?? 0,
    filamentId: initial?.filamentId ?? filaments[0]?.id ?? 0,
    printerId: initial?.printerId ?? printers.find((printer) => printer.type === defaultMaterialType)?.id ?? printers[0]?.id ?? 0,
    finishId: initial?.finishPresetId ?? finishes[0]?.id ?? 0,
    freightCost: initial?.freightCost ?? 0,
    pricingMode: initial?.pricingMode === "MANUAL" ? "MANUAL" : "PERCENT",
    profitPercent: initial?.profitPercent ?? settings.defaultProfitPercent,
    manualFinalPrice: initial?.finalPrice ?? 0,
  } as const;

  const [materialType, setMaterialType] = useState(defaultMaterialType);
  const [quantity, setQuantity] = useState(defaults.quantity);
  const [heightMm, setHeightMm] = useState(defaults.heightMm);
  const [widthMm, setWidthMm] = useState(defaults.widthMm);
  const [depthMm, setDepthMm] = useState(defaults.depthMm);
  const [resinMl, setResinMl] = useState(defaults.resinMl);
  const [filamentGrams, setFilamentGrams] = useState(defaults.filamentGrams);
  const [hours, setHours] = useState(defaults.hours);
  const [minutes, setMinutes] = useState(defaults.minutes);
  const [resinId, setResinId] = useState(defaults.resinId);
  const [filamentId, setFilamentId] = useState(defaults.filamentId);
  const [printerId, setPrinterId] = useState(defaults.printerId);
  const [finishId, setFinishId] = useState(defaults.finishId);
  const [freightCost, setFreightCost] = useState(defaults.freightCost);
  const [pricingMode, setPricingMode] = useState(defaults.pricingMode);
  const [profitPercent, setProfitPercent] = useState(defaults.profitPercent);
  const [manualFinalPrice, setManualFinalPrice] = useState(defaults.manualFinalPrice);

  const filteredPrinters = useMemo(() => printers.filter((printer) => printer.type === materialType), [printers, materialType]);

  const selectedResin = resins.find((item) => item.id === resinId) ?? resins[0];
  const selectedFilament = filaments.find((item) => item.id === filamentId) ?? filaments[0];
  const selectedPrinter = filteredPrinters.find((item) => item.id === printerId) ?? filteredPrinters[0];
  const selectedFinish = finishes.find((item) => item.id === finishId) ?? finishes[0];
  const resinCostPerMl = selectedResin ? selectedResin.manualCostPerMl ?? selectedResin.calculatedCostPerMl : 0;
  const filamentCostPerGram = selectedFilament ? selectedFilament.manualCostPerGram ?? selectedFilament.calculatedCostPerGram : 0;
  const materialCost = materialType === "FILAMENT" ? filamentGrams * filamentCostPerGram : resinMl * resinCostPerMl;
  const totalMinutes = Math.max(0, hours * 60 + minutes);

  const totals = useMemo(
    () => calculateQuote({
      materialCost,
      powerWatts: selectedPrinter?.powerWatts ?? 0,
      printTimeMinutes: totalMinutes,
      kwhCost: settings.kwhCost,
      finishCost: selectedFinish?.fixedCost ?? 0,
      freightCost,
      quantity,
      pricingMode,
      profitPercent,
      manualFinalPrice,
    }),
    [materialCost, selectedPrinter, totalMinutes, settings.kwhCost, selectedFinish, freightCost, quantity, pricingMode, profitPercent, manualFinalPrice],
  );

  const costRows = [
    { label: MATERIAL_TYPE_LABELS[materialType], value: totals.materialCost, icon: TbPackage },
    { label: "Energia", value: totals.energyCost, icon: TbPrinter },
    { label: "Acabamento", value: totals.finishCost, icon: TbPaint },
    { label: "Frete", value: totals.freightCost, icon: TbTruckDelivery },
  ];

  function selectMaterialType(next: string) {
    setMaterialType(next);
    const matchingPrinters = printers.filter((printer) => printer.type === next);
    setPrinterId(matchingPrinters[0]?.id ?? 0);
  }

  function clearForm() {
    formRef.current?.reset();
    setQuantity(1); setHeightMm(0); setWidthMm(0); setDepthMm(0); setResinMl(0); setFilamentGrams(0);
    setHours(0); setMinutes(0); setResinId(resins[0]?.id ?? 0); setFilamentId(filaments[0]?.id ?? 0);
    setPrinterId(printers.find((printer) => printer.type === materialType)?.id ?? printers[0]?.id ?? 0);
    setFinishId(finishes[0]?.id ?? 0); setFreightCost(0); setPricingMode("PERCENT");
    setProfitPercent(settings.defaultProfitPercent); setManualFinalPrice(0);
  }

  if ((!hasResinSetup && !hasFilamentSetup) || !finishes.length) {
    return (
      <div className="panel p-8 text-center">
        <TbInfoCircle className="mx-auto mb-3 text-primary" size={32} />
        <h2 className="font-display text-xl font-semibold">Cadastros básicos necessários</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Ative ou crie ao menos um material (resina ou filamento) com uma impressora compatível, e um acabamento, antes de montar um orçamento.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <input type="hidden" name="pricingMode" value={pricingMode} />
      <input type="hidden" name="materialType" value={materialType} />
      <div className="min-w-0 space-y-4">
        <div className="panel flex divide-x divide-border overflow-hidden">
          {["Dados", "Produção", "Preço"].map((step, index) => (
            <div key={step} className={`flex flex-1 items-center gap-2 border-b-2 px-4 py-3 ${index === 0 ? "border-primary" : "border-transparent"}`}>
              <span className={`font-display text-xs tabular-nums ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>0{index + 1}</span>
              <span className={`text-sm ${index === 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>{step}</span>
            </div>
          ))}
        </div>

        {state.error ? <div role="alert" className="border-l-2 border-red-500/60 bg-white/[0.02] px-4 py-3 text-sm text-red-300">{state.error}</div> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel overflow-hidden">
            <h2 className="section-title"><TbUser className="text-zinc-300" size={20} /> Modelo e cliente</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="Nome do modelo" className="sm:col-span-2">
                <Input name="modelName" defaultValue={initial?.modelName ?? ""} placeholder="Ex.: Guardião da Forja" required />
                <FieldError errors={state.fieldErrors} name="modelName" />
              </Field>
              <Field label="Cliente (opcional)"><Input name="customerName" defaultValue={initial?.customerName ?? ""} placeholder="Nome do cliente" /></Field>
              <Field label="Quantidade"><Input name="quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></Field>
              <Field label="Descrição (opcional)" className="sm:col-span-2"><Textarea name="description" defaultValue={initial?.description ?? ""} placeholder="Escala, finalidade ou detalhes do modelo" className="min-h-20" /></Field>
              <Field label="Link do Google Drive" className="sm:col-span-2"><Input name="driveLink" type="url" defaultValue={initial?.driveLink ?? ""} placeholder="https://drive.google.com/..." /></Field>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <h2 className="section-title"><TbRulerMeasure className="text-zinc-300" size={20} /> Dimensões e consumo</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Altura (mm)"><Input name="heightMm" type="number" min="0" step="0.01" value={heightMm} onChange={(e) => setHeightMm(Number(e.target.value))} /></Field>
              <Field label="Largura (mm)"><Input name="widthMm" type="number" min="0" step="0.01" value={widthMm} onChange={(e) => setWidthMm(Number(e.target.value))} /></Field>
              <Field label="Profundidade (mm)"><Input name="depthMm" type="number" min="0" step="0.01" value={depthMm} onChange={(e) => setDepthMm(Number(e.target.value))} /></Field>
              {materialType === "FILAMENT" ? (
                <Field label="Consumo de filamento (g)" className="sm:col-span-3"><Input name="filamentGrams" type="number" min="0" step="0.01" value={filamentGrams} onChange={(e) => setFilamentGrams(Number(e.target.value))} /></Field>
              ) : (
                <Field label="Consumo de resina (ml)" className="sm:col-span-3"><Input name="resinMl" type="number" min="0" step="0.01" value={resinMl} onChange={(e) => setResinMl(Number(e.target.value))} /></Field>
              )}
              <Field label="Tempo — horas"><Input name="printHours" type="number" min="0" step="1" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></Field>
              <Field label="Tempo — minutos"><Input name="printMinutes" type="number" min="0" max="59" step="1" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></Field>
              <div className="flex items-end"><p className="w-full border-l-2 border-teal-500/50 bg-white/[0.02] px-3 py-2.5 text-xs text-teal-300">Total: {formatDuration(totalMinutes)}</p></div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <h2 className="section-title"><TbBox className="text-zinc-300" size={20} /> Material e impressora</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="Tipo de impressão">
                <Select value={materialType} onChange={(e) => selectMaterialType(e.target.value)}>
                  {hasResinSetup ? <option value="RESIN">Resina</option> : null}
                  {hasFilamentSetup ? <option value="FILAMENT">Filamento</option> : null}
                </Select>
              </Field>
              {materialType === "FILAMENT" ? (
                <Field label="Filamento utilizado"><Select name="filamentId" value={filamentId} onChange={(e) => setFilamentId(Number(e.target.value))}>{filaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
              ) : (
                <Field label="Resina utilizada"><Select name="resinId" value={resinId} onChange={(e) => setResinId(Number(e.target.value))}>{resins.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
              )}
              <Field label="Impressora" className="sm:col-span-2"><Select name="printerId" value={printerId} onChange={(e) => setPrinterId(Number(e.target.value))}>{filteredPrinters.map((item) => <option key={item.id} value={item.id}>{item.name}{item.model ? ` · ${item.model}` : ""}</option>)}</Select></Field>
              {materialType === "FILAMENT" ? (
                <div className="rounded-md border border-border bg-black/15 px-3 py-3 text-xs text-muted-foreground"><span className="block text-zinc-200">{formatCurrency(filamentCostPerGram, settings.currency)}/g</span>Custo efetivo do filamento</div>
              ) : (
                <div className="rounded-md border border-border bg-black/15 px-3 py-3 text-xs text-muted-foreground"><span className="block text-zinc-200">{formatCurrency(resinCostPerMl, settings.currency)}/ml</span>Custo efetivo da resina</div>
              )}
              <div className="rounded-md border border-border bg-black/15 px-3 py-3 text-xs text-muted-foreground"><span className="block text-zinc-200">{selectedPrinter?.powerWatts ?? 0} W</span>Potência média da máquina</div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <h2 className="section-title"><TbPaint className="text-zinc-300" size={20} /> Acabamento e frete</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="Preset de acabamento" className="sm:col-span-2"><Select name="finishPresetId" value={finishId} onChange={(e) => setFinishId(Number(e.target.value))}>{finishes.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatCurrency(item.fixedCost)}</option>)}</Select></Field>
              <Field label="Custo do frete"><Input name="freightCost" type="number" min="0" step="0.01" value={freightCost} onChange={(e) => setFreightCost(Number(e.target.value))} /></Field>
              <Field label="Status"><Select name="status" defaultValue={initial?.status ?? "QUOTE"}>{QUOTE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</Select></Field>
              <Field label="Observação de frete" className="sm:col-span-2"><Input name="freightNotes" defaultValue={initial?.freightNotes ?? ""} placeholder="Transportadora, retirada ou prazo" /></Field>
            </div>
          </section>
        </div>

        <section className="panel p-4">
          <Label>Observações internas</Label>
          <Textarea name="notes" defaultValue={initial?.notes ?? ""} placeholder="Informações adicionais para a ficha técnica" />
        </section>
      </div>

      <aside className="panel overflow-hidden xl:sticky xl:top-6">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Composição de custos</h2>
            <TbInfoCircle className="text-muted-foreground" size={19} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Atualizado em tempo real</p>
        </div>

        <div className="space-y-5 p-5">
          {costRows.map((row) => {
            const ratio = totals.totalCost > 0 ? Math.min(100, (row.value / totals.totalCost) * 100) : 0;
            const Icon = row.icon;
            return (
              <div key={row.label}>
                <div className="mb-2 flex items-center gap-2 text-sm"><Icon className="text-zinc-400" /><span className="flex-1">{row.label}</span><strong className="font-medium tabular-nums">{formatCurrency(row.value, settings.currency)}</strong></div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-primary transition-all" style={{ width: `${ratio}%` }} /></div>
              </div>
            );
          })}

          <div className="space-y-2 border-y border-border py-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Custo unitário</span><span className="tabular-nums">{formatCurrency(totals.unitCost)}</span></div>
            <div className="flex justify-between"><span>Custo total</span><strong className="text-base tabular-nums text-primary">{formatCurrency(totals.totalCost)}</strong></div>
          </div>

          <div>
            <p className="metric-label mb-3">Forma de precificação</p>
            <div className="grid grid-cols-2 rounded-md border border-border p-1">
              <button type="button" onClick={() => setPricingMode("PERCENT")} className={`rounded px-2 py-2 text-xs font-semibold transition ${pricingMode === "PERCENT" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>Margem %</button>
              <button type="button" onClick={() => setPricingMode("MANUAL")} className={`rounded px-2 py-2 text-xs font-semibold transition ${pricingMode === "MANUAL" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>Preço manual</button>
            </div>
          </div>

          {pricingMode === "PERCENT" ? (
            <Field label="Percentual de lucro"><div className="relative"><Input name="profitPercent" type="number" min="0" step="0.01" value={profitPercent} onChange={(e) => setProfitPercent(Number(e.target.value))} className="pr-10" /><span className="pointer-events-none absolute right-3 top-2.5 text-sm text-muted-foreground">%</span></div><input type="hidden" name="manualFinalPrice" value={totals.finalPrice} /></Field>
          ) : (
            <><input type="hidden" name="profitPercent" value={totals.profitPercent} /><Field label="Preço final manual"><Input name="manualFinalPrice" type="number" min="0" step="0.01" value={manualFinalPrice} onChange={(e) => setManualFinalPrice(Number(e.target.value))} /></Field></>
          )}

          <div className="border-t border-border pt-5">
            <div className="flex items-end justify-between gap-4"><div><p className="metric-label">Lucro projetado</p><p className={`mt-1 text-lg font-semibold tabular-nums ${totals.profitValue < 0 ? "text-red-300" : "text-teal-300"}`}>{formatCurrency(totals.profitValue)}</p></div><p className="text-sm tabular-nums text-muted-foreground">{totals.profitPercent.toFixed(2)}%</p></div>
            <p className="mt-5 font-display text-lg font-semibold">Preço final</p>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums text-primary">{formatCurrency(totals.finalPrice)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(totals.unitPrice)} por peça</p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? <TbRefresh className="animate-spin" /> : <TbCheck size={20} />}{pending ? "Salvando..." : initial ? "Salvar alterações" : "Salvar orçamento"}</Button>
          <Button type="button" variant="secondary" className="w-full" onClick={clearForm} disabled={pending}><TbRefresh /> Limpar formulário</Button>
          <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground"><TbCoin /> kWh configurado em {formatCurrency(settings.kwhCost)}</p>
        </div>
      </aside>
    </form>
  );
}
