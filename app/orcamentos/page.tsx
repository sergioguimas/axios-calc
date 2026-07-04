import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { TbCopy, TbEye, TbFilter, TbPencil, TbPlus, TbSearch } from "react-icons/tb";
import { deleteQuoteAction, duplicateQuoteAction } from "@/app/actions";
import { ConfirmSubmit, SubmitButton } from "@/components/form-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/calculations";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const from = params.from ? new Date(`${params.from}T00:00:00`) : undefined;
  const to = params.to ? new Date(`${params.to}T23:59:59`) : undefined;
  const where: Prisma.QuoteWhereInput = {
    ...(search ? { OR: [{ modelName: { contains: search } }, { customerName: { contains: search } }] } : {}),
    ...(status ? { status } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };
  const quotes = await prisma.quote.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader eyebrow="Registro da oficina" title="Histórico de orçamentos" description={`${quotes.length} registro${quotes.length === 1 ? "" : "s"} encontrado${quotes.length === 1 ? "" : "s"}.`} actions={<Link href="/orcamentos/novo" className={cn(buttonVariants())}><TbPlus /> Novo orçamento</Link>} />

      {params.error ? <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{params.error}</div> : null}
      {params.deleted ? <div className="mb-4 rounded-md border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-200">Orçamento excluído.</div> : null}

      <form className="panel mb-4 grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_180px_160px_160px_auto]">
        <div className="relative"><TbSearch className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><Input name="search" defaultValue={search} placeholder="Modelo ou cliente" className="pl-9" /></div>
        <Select name="status" defaultValue={status}><option value="">Todos os status</option>{QUOTE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
        <Input type="date" name="from" defaultValue={params.from} aria-label="Data inicial" />
        <Input type="date" name="to" defaultValue={params.to} aria-label="Data final" />
        <SubmitButton variant="secondary"><TbFilter /> Filtrar</SubmitButton>
      </form>

      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Modelo / cliente</th><th>Status</th><th>Ficha técnica</th><th>Custo</th><th>Preço final</th><th>Criado em</th><th className="text-right">Ações</th></tr></thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td><Link href={`/orcamentos/${quote.id}`} className="font-semibold text-zinc-100 hover:text-primary">{quote.modelName}</Link><span className="mt-1 block text-xs text-muted-foreground">{quote.customerName || "Cliente não informado"}</span></td>
                <td><Badge status={quote.status}>{STATUS_LABELS[quote.status]}</Badge></td>
                <td className="text-xs text-muted-foreground">{quote.resinMl.toLocaleString("pt-BR")} ml · {Math.floor(quote.printTimeMinutes / 60)}h {quote.printTimeMinutes % 60}min<br />{quote.quantity} peça{quote.quantity === 1 ? "" : "s"}</td>
                <td className="tabular-nums text-muted-foreground">{formatCurrency(quote.totalCost)}</td>
                <td className="font-semibold tabular-nums text-primary">{formatCurrency(quote.finalPrice)}</td>
                <td className="text-muted-foreground">{quote.createdAt.toLocaleDateString("pt-BR")}</td>
                <td><div className="flex justify-end gap-1"><Link href={`/orcamentos/${quote.id}`} aria-label="Visualizar" title="Visualizar" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}><TbEye /></Link><Link href={`/orcamentos/${quote.id}/editar`} aria-label="Editar" title="Editar" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}><TbPencil /></Link><form action={duplicateQuoteAction}><input type="hidden" name="id" value={quote.id} /><SubmitButton variant="ghost" size="icon" title="Duplicar" aria-label="Duplicar"><TbCopy /></SubmitButton></form><form action={deleteQuoteAction}><input type="hidden" name="id" value={quote.id} /><ConfirmSubmit size="icon" message={`Excluir o orçamento “${quote.modelName}”?`} aria-label="Excluir" title="Excluir" /></form></div></td>
              </tr>
            ))}
            {!quotes.length ? <tr><td colSpan={7} className="py-16 text-center text-muted-foreground">Nenhum orçamento corresponde aos filtros.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
