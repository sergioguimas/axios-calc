import Link from "next/link";
import { TbArrowRight, TbCoin, TbFileCheck, TbFileInvoice, TbHammer, TbPlus, TbSettings, TbSparkles } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/calculations";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [total, approved, produced, aggregates, latest] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "APPROVED" } }),
    prisma.quote.count({ where: { status: "PRODUCED" } }),
    prisma.quote.aggregate({ _avg: { totalCost: true, finalPrice: true, profitValue: true } }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const metrics = [
    { label: "Orçamentos", value: String(total), detail: "registros no histórico", icon: TbFileInvoice },
    { label: "Aprovados", value: String(approved), detail: total ? `${Math.round((approved / total) * 100)}% do total` : "aguardando dados", icon: TbFileCheck },
    { label: "Produzidos", value: String(produced), detail: "pedidos concluídos", icon: TbHammer },
    { label: "Lucro médio", value: formatCurrency(aggregates._avg.profitValue ?? 0), detail: "projeção por orçamento", icon: TbSparkles },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Painel da oficina"
        title="Visão geral"
        description="Custos, preços e atividade recente da operação."
        actions={<><Link href="/configuracoes" className={cn(buttonVariants({ variant: "secondary" }))}><TbSettings /> Configurações</Link><Link href="/orcamentos/novo" className={cn(buttonVariants())}><TbPlus /> Novo orçamento</Link></>}
      />

      <section className="panel flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex-1 px-5 py-4">
              <div className="flex items-center gap-1.5"><Icon className="text-primary" size={14} strokeWidth={2} /><p className="metric-label">{metric.label}</p></div>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="items-center border-b border-border pb-4"><div><h2 className="font-display text-lg font-semibold">Últimos orçamentos</h2><p className="mt-1 text-xs text-muted-foreground">Registros mais recentes da oficina</p></div><Link href="/orcamentos" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-amber-300">Ver histórico <TbArrowRight /></Link></CardHeader>
          {latest.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Modelo</th><th>Cliente</th><th>Status</th><th>Custo</th><th>Preço final</th><th>Data</th></tr></thead><tbody>{latest.map((quote) => <tr key={quote.id}><td><Link href={`/orcamentos/${quote.id}`} className="font-semibold text-zinc-100 hover:text-primary">{quote.modelName}</Link></td><td className="text-muted-foreground">{quote.customerName || "—"}</td><td><Badge status={quote.status}>{STATUS_LABELS[quote.status]}</Badge></td><td className="tabular-nums text-muted-foreground">{formatCurrency(quote.totalCost)}</td><td className="font-semibold tabular-nums text-zinc-100">{formatCurrency(quote.finalPrice)}</td><td className="text-muted-foreground">{quote.createdAt.toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center"><TbFileInvoice className="mx-auto text-primary" size={32} /><h3 className="mt-3 font-display text-lg font-semibold">A forja está vazia</h3><p className="mt-1 text-sm text-muted-foreground">Crie o primeiro orçamento para começar.</p><Link href="/orcamentos/novo" className={cn(buttonVariants(), "mt-5")}><TbPlus /> Novo orçamento</Link></div>}
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-4"><div><h2 className="font-display text-lg font-semibold">Médias da operação</h2><p className="mt-1 text-xs text-muted-foreground">Baseadas no histórico salvo</p></div></CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div><p className="metric-label">Custo médio</p><p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatCurrency(aggregates._avg.totalCost ?? 0)}</p></div>
            <div className="h-px bg-border" />
            <div><p className="metric-label">Preço médio final</p><p className="mt-1 font-display text-2xl font-semibold tabular-nums text-primary">{formatCurrency(aggregates._avg.finalPrice ?? 0)}</p></div>
            <div className="callout border-teal-500/50"><TbCoin className="mb-2 text-teal-300" size={18} /><p className="leading-relaxed">Os indicadores usam os valores preservados em cada orçamento, mesmo que os cadastros sejam alterados depois.</p></div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
