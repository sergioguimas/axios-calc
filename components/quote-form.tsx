"use client";

import { useActionState, useMemo, useRef, useState } from "react";
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
import { QUOTE_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OptionBase = { id: number; name: string };
type ResinOption = OptionBase & { calculatedCostPerMl: number; manualCostPerMl: number | null };
type PrinterOption = OptionBase & { powerWatts: number; model: string | null };
type FinishOption = OptionBase & { fixedCost: number; description: string | null };

export type QuoteFormValue = {
  modelName: string;
  customerName: string | null;
  description: string | null;
  quantity: number;
  status: string;
  driveLink: string | null;
  notes: string | null;
  freightNotes: string | null;
  heightMm: number;
  widthMm: number;
  depthMm: number;
  resinMl: number;
  printTimeMinutes: number;
  resinId: number | null;
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
  printers,
  finishes,
  initial,
}: {
  action: QuoteAction;
  settings: { kwhCost: number; defaultProfitPercent: number; currency: string };
  resins: ResinOption[];
  printers: PrinterOption[];
  finishes: FinishOption[];
  initial?: QuoteFormValue;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const defaults = {
    quantity: initial?.quantity ?? 1,
    heightMm: initial?.heightMm ?? 0,
    widthMm: initial?.widthMm ?? 0,
    depthMm: initial?.depthMm ?? 0,
    resinMl: initial?.resinMl ?? 0,
    hours: initial ? Math.floor(initial.printTimeMinutes / 60) : 0,
    minutes: initial ? initial.printTimeMinutes % 60 : 0,
    resinId: initial?.resinId ?? resins[0]?.id ?? 0,
    printerId: initial?.printerId ?? printers[0]?.id ?? 0,
    finishId: initial?.finishPresetId ?? finishes[0]?.id ?? 0,
    freightCost: initial?.freightCost ?? 0,
    pricingMode: initial?.pricingMode === "MANUAL" ? "MANUAL" : "PERCENT",
    profitPercent: initial?.profitPercent ?? settings.defaultProfitPercent,
    manualFinalPrice: initial?.finalPrice ?? 0,
  } as const;

  const [quantity, setQuantity] = useState(defaults.quantity);
  const [heightMm, setHeightMm] = useState(defaults.heightMm);
  const [widthMm, setWidthMm] = useState(defaults.widthMm);
  const [depthMm, setDepthMm] = useState(defaults.depthMm);
  const [resinMl, setResinMl] = useState(defaults.resinMl);
  const [hours, setHours] = useState(defaults.hours);
  const [minutes, setMinutes] = useState(defaults.minutes);
  const [resinId, setResinId] = useState(defaults.resinId);
  const [printerId, setPrinterId] = useState(defaults.printerId);
  const [finishId, setFinishId] = useState(defaults.finishId);
  const [freightCost, setFreightCost] = useState(defaults.freightCost);
  const [pricingMode, setPricingMode] = useState(defaults.pricingMode);
  const [profitPercent, setProfitPercent] = useState(defaults.profitPercent);
  const [manualFinalPrice, setManualFinalPrice] = useState(defaults.manualFinalPrice);

  const selectedResin = resins.find((item) => item.id === resinId) ?? resins[0];
  const selectedPrinter = printers.find((item) => item.id === printerId) ?? printers[0];
  const selectedFinish = finishes.find((item) => item.id === finishId) ?? finishes[0];
  const resinCostPerMl = selectedResin ? selectedResin.manualCostPerMl ?? selectedResin.calculatedCostPerMl : 0;
  const totalMinutes = Math.max(0, hours * 60 + minutes);

  const totals = useMemo(
    () => calculateQuote({
      resinMl,
      resinCostPerMl,
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
    [resinMl, resinCostPerMl, selectedPrinter, totalMinutes, settings.kwhCost, selectedFinish, freightCost, quantity, pricingMode, profitPercent, manualFinalPrice],
  );

  const costRows = [
    { label: "Resina", value: totals.materialCost, icon: TbPackage },
    { label: "Energia", value: totals.energyCost, icon: TbPrinter },
    { label: "Acabamento", value: totals.finishCost, icon: TbPaint },
    { label: "Frete", value: totals.freightCost, icon: TbTruckDelivery },
  ];

  function clearForm() {
    formRef.current?.reset();
    setQuantity(1); setHeightMm(0); setWidthMm(0); setDepthMm(0); setResinMl(0);
    setHours(0); setMinutes(0); setResinId(resins[0]?.id ?? 0); setPrinterId(printers[0]?.id ?? 0);
    setFinishId(finishes[0]?.id ?? 0); setFreightCost(0); setPricingMode("PERCENT");
    setProfitPercent(settings.defaultProfitPercent); setManualFinalPrice(0);
  }

  if (!resins.length || !printers.length || !finishes.length) {
    return (
      <div className="panel p-8 text-center">
        <TbInfoCircle className="mx-auto mb-3 text-primary" size={32} />
        <h2 className="font-display text-xl font-semibold">Cadastros básicos necessários</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Ative ou crie ao menos uma resina, uma impressora e um acabamento antes de montar um orçamento.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <input type="hidden" name="pricingMode" value={pricingMode} />
      <div className="min-w-0 space-y-4">
        <div className="panel flex items-center gap-3 px-5 py-4">
          {["Dados", "Produção", "Preço"].map((step, index) => (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/[0.03] text-muted-foreground"}`}>{index + 1}</span>
              <span className={index === 0 ? "text-sm font-semibold text-primary" : "text-sm text-muted-foreground"}>{step}</span>
              {index < 2 ? <span className="hidden h-px flex-1 bg-border sm:block" /> : null}
            </div>
          ))}
        </div>

        {state.error ? <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</div> : null}

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
              <Field label="Consumo de resina (ml)" className="sm:col-span-3"><Input name="resinMl" type="number" min="0" step="0.01" value={resinMl} onChange={(e) => setResinMl(Number(e.target.value))} /></Field>
              <Field label="Tempo — horas"><Input name="printHours" type="number" min="0" step="1" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></Field>
              <Field label="Tempo — minutos"><Input name="printMinutes" type="number" min="0" max="59" step="1" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></Field>
              <div className="flex items-end"><p className="w-full rounded-md border border-teal-500/15 bg-teal-500/[0.06] px-3 py-2.5 text-xs text-teal-300">Total: {formatDuration(totalMinutes)}</p></div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <h2 className="section-title"><TbBox className="text-zinc-300" size={20} /> Resina e impressora</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="Tipo de impressão"><Select disabled value="RESIN"><option value="RESIN">Resina</option><option value="FILAMENT">Filamento — em breve</option></Select></Field>
              <Field label="Resina utilizada"><Select name="resinId" value={resinId} onChange={(e) => setResinId(Number(e.target.value))}>{resins.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
              <Field label="Impressora" className="sm:col-span-2"><Select name="printerId" value={printerId} onChange={(e) => setPrinterId(Number(e.target.value))}>{printers.map((item) => <option key={item.id} value={item.id}>{item.name}{item.model ? ` · ${item.model}` : ""}</option>)}</Select></Field>
              <div className="rounded-md border border-border bg-black/15 px-3 py-3 text-xs text-muted-foreground"><span className="block text-zinc-200">{formatCurrency(resinCostPerMl, settings.currency)}/ml</span>Custo efetivo da resina</div>
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
