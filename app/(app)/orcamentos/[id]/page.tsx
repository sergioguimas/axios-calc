import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft, TbCopy, TbExternalLink, TbFileDescription, TbPencil, TbPrinter, TbRulerMeasure } from "react-icons/tb";
import { duplicateQuoteAction, updateQuoteStatusAction } from "@/app/actions";
import { SubmitButton } from "@/components/form-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDuration, formatPercent } from "@/lib/calculations";
import { MATERIAL_TYPE_LABELS, QUOTE_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Fact({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return <div><dt className="metric-label">{label}</dt><dd className={`mt-1.5 text-sm ${accent ? "font-semibold text-primary" : "text-zinc-200"}`}>{value || "—"}</dd></div>;
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const quote = await prisma.quote.findFirst({ where: { id: Number(id), userId: session.id } });
  if (!quote) notFound();

  const isFilament = quote.materialType === "FILAMENT";
  const costs = [
    [MATERIAL_TYPE_LABELS[quote.materialType], quote.materialCost],
    ["Energia", quote.energyCost],
    ["Acabamento", quote.finishCost],
    ["Frete", quote.freightCost],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={`Orçamento #${String(quote.id).padStart(4, "0")}`}
        title={quote.modelName}
        description={quote.customerName ? `Cliente: ${quote.customerName}` : "Cliente não informado"}
        actions={<><Link href="/orcamentos" className={cn(buttonVariants({ variant: "ghost" }))}><TbArrowLeft /> Histórico</Link><form action={duplicateQuoteAction}><input type="hidden" name="id" value={quote.id} /><SubmitButton variant="secondary"><TbCopy /> Duplicar</SubmitButton></form><Link href={`/orcamentos/${quote.id}/editar`} className={cn(buttonVariants())}><TbPencil /> Editar</Link></>}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="items-center border-b border-border pb-4"><div className="flex items-center gap-2"><TbFileDescription className="text-primary" size={21} /><h2 className="font-display text-lg font-semibold">Dados gerais</h2></div><Badge status={quote.status}>{STATUS_LABELS[quote.status]}</Badge></CardHeader>
            <CardContent className="pt-5"><dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Fact label="Modelo" value={quote.modelName} /><Fact label="Cliente" value={quote.customerName} /><Fact label="Quantidade" value={`${quote.quantity} peça${quote.quantity === 1 ? "" : "s"}`} /><Fact label="Descrição" value={quote.description} /><Fact label="Criado em" value={quote.createdAt.toLocaleString("pt-BR")} /><Fact label="Atualizado em" value={quote.updatedAt.toLocaleString("pt-BR")} /></dl>{quote.driveLink ? <a href={quote.driveLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-amber-300">Abrir arquivos no Google Drive <TbExternalLink /></a> : null}</CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4"><div className="flex items-center gap-2"><TbRulerMeasure className="text-primary" size={21} /><h2 className="font-display text-lg font-semibold">Ficha técnica da impressão</h2></div></CardHeader>
            <CardContent className="pt-5">
              <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Fact label="Dimensões (A × L × P)" value={`${quote.heightMm.toLocaleString("pt-BR")} × ${quote.widthMm.toLocaleString("pt-BR")} × ${quote.depthMm.toLocaleString("pt-BR")} mm`} />
                {isFilament
                  ? <Fact label="Filamento previsto" value={`${quote.filamentGrams.toLocaleString("pt-BR")} g`} />
                  : <Fact label="Resina prevista" value={`${quote.resinMl.toLocaleString("pt-BR")} ml`} />}
                <Fact label="Tempo de impressão" value={formatDuration(quote.printTimeMinutes)} />
                <Fact label="Material" value={MATERIAL_TYPE_LABELS[quote.materialType]} />
                {isFilament
                  ? <><Fact label="Filamento utilizado" value={quote.filamentNameSnapshot} /><Fact label="Custo preservado" value={quote.filamentCostPerGramSnapshot != null ? `${formatCurrency(quote.filamentCostPerGramSnapshot)}/g` : "—"} /></>
                  : <><Fact label="Resina utilizada" value={quote.resinNameSnapshot} /><Fact label="Custo preservado" value={quote.resinCostPerMlSnapshot != null ? `${formatCurrency(quote.resinCostPerMlSnapshot)}/ml` : "—"} /></>}
                <Fact label="Impressora" value={quote.printerNameSnapshot} />
                <Fact label="Potência preservada" value={`${quote.printerPowerWattsSnapshot.toLocaleString("pt-BR")} W`} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-4"><div className="flex items-center gap-2"><TbPrinter className="text-primary" size={21} /><h2 className="font-display text-lg font-semibold">Acabamento, frete e notas</h2></div></CardHeader>
            <CardContent className="pt-5"><dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Fact label="Acabamento" value={quote.finishNameSnapshot} /><Fact label="Custo do acabamento" value={formatCurrency(quote.finishCostSnapshot)} /><Fact label="Observação de frete" value={quote.freightNotes} /><Fact label="Observações" value={quote.notes} /></dl></CardContent>
          </Card>
        </div>

        <aside className="panel overflow-hidden xl:sticky xl:top-6">
          <div className="border-b border-border px-5 py-4"><h2 className="font-display text-lg font-semibold">Resumo financeiro</h2><p className="mt-1 text-xs text-muted-foreground">Valores preservados neste orçamento</p></div>
          <div className="space-y-4 p-5">
            {costs.map(([label, value]) => <div key={label} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{formatCurrency(value)}</span></div>)}
            <div className="flex items-center justify-between border-y border-border py-4"><span className="font-medium">Custo total</span><strong className="tabular-nums text-primary">{formatCurrency(quote.totalCost)}</strong></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Lucro projetado</span><span className={quote.profitValue >= 0 ? "tabular-nums text-teal-300" : "tabular-nums text-red-300"}>{formatCurrency(quote.profitValue)}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Margem equivalente</span><span className="tabular-nums">{formatPercent(quote.profitPercent)}</span></div>
            <div className="pt-3"><p className="metric-label">Preço final</p><p className="mt-1 font-display text-4xl font-bold tabular-nums text-primary">{formatCurrency(quote.finalPrice)}</p><p className="mt-1 text-xs text-muted-foreground">{formatCurrency(quote.unitPrice)} por peça</p></div>
            <form action={updateQuoteStatusAction} className="border-t border-border pt-5"><input type="hidden" name="id" value={quote.id} /><label className="metric-label mb-2 block" htmlFor="status">Alterar status</label><div className="flex gap-2"><Select id="status" name="status" defaultValue={quote.status}>{QUOTE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</Select><SubmitButton size="sm">Salvar</SubmitButton></div></form>
          </div>
        </aside>
      </div>
    </>
  );
}
