import Link from "next/link";
import {
  TbBolt,
  TbCheck,
  TbEdit,
  TbFlask,
  TbPaint,
  TbPrinter,
  TbSettings,
} from "react-icons/tb";
import {
  deleteFinishAction,
  deletePrinterAction,
  deleteResinAction,
  toggleFinishAction,
  togglePrinterAction,
  toggleResinAction,
  updateSettingsAction,
  upsertFinishAction,
  upsertPrinterAction,
  upsertResinAction,
} from "@/app/actions";
import { ConfirmSubmit, SubmitButton } from "@/components/form-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/calculations";
import { UNIT_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs = [
  { value: "geral", label: "Geral", icon: TbSettings },
  { value: "resinas", label: "Resinas", icon: TbFlask },
  { value: "impressoras", label: "Impressoras", icon: TbPrinter },
  { value: "acabamentos", label: "Acabamentos", icon: TbPaint },
];

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label>{children}</div>;
}

function Feedback({ params }: { params: Record<string, string | undefined> }) {
  if (params.error) return <div className="mb-4 border-l-2 border-red-500/60 bg-white/[0.02] px-4 py-3 text-sm text-red-300">{params.error}</div>;
  if (params.saved) return <div className="mb-4 flex items-center gap-2 border-l-2 border-teal-500/60 bg-white/[0.02] px-4 py-3 text-sm text-teal-300"><TbCheck size={16} /> Alterações salvas.</div>;
  if (params.deleted) return <div className="mb-4 flex items-center gap-2 border-l-2 border-teal-500/60 bg-white/[0.02] px-4 py-3 text-sm text-teal-300"><TbCheck size={16} /> Cadastro excluído.</div>;
  return null;
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const activeTab = tabs.some((tab) => tab.value === params.tab) ? params.tab! : "geral";
  const [settings, resins, printers, finishes] = await Promise.all([
    prisma.appSettings.findUnique({ where: { id: 1 } }),
    prisma.resin.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    prisma.printer.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    prisma.finishPreset.findMany({ orderBy: [{ isActive: "desc" }, { fixedCost: "asc" }] }),
  ]);
  const editId = Number(params.edit || 0);
  const editResin = activeTab === "resinas" ? resins.find((item) => item.id === editId) : undefined;
  const editPrinter = activeTab === "impressoras" ? printers.find((item) => item.id === editId) : undefined;
  const editFinish = activeTab === "acabamentos" ? finishes.find((item) => item.id === editId) : undefined;

  return (
    <>
      <PageHeader eyebrow="Parâmetros da oficina" title="Configurações" description="Gerencie custos globais e os cadastros usados nos orçamentos." />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => { const Icon = tab.icon; return <Link key={tab.value} href={`/configuracoes?tab=${tab.value}`} className={cn("flex min-w-fit items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition", activeTab === tab.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-zinc-100")}><Icon size={18} />{tab.label}</Link>; })}
      </div>

      <Feedback params={params} />

      {activeTab === "geral" ? (
        <form action={updateSettingsAction} className="panel max-w-4xl overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2 className="font-display text-lg font-semibold">Configurações gerais</h2><p className="mt-1 text-xs text-muted-foreground">Estes valores entram nos novos cálculos. Orçamentos salvos mantêm seus snapshots.</p></div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <FormField label="Nome da empresa"><Input name="companyName" defaultValue={settings?.companyName ?? ""} placeholder="Oficina 3D" /></FormField>
            <FormField label="Moeda"><Select name="currency" value="BRL" disabled><option value="BRL">BRL · Real brasileiro</option></Select></FormField>
            <FormField label="Custo do kWh"><Input name="kwhCost" type="number" min="0" step="0.0001" defaultValue={settings?.kwhCost ?? 1.14} required /></FormField>
            <FormField label="Lucro padrão (%)"><Input name="defaultProfitPercent" type="number" min="0" step="0.01" defaultValue={settings?.defaultProfitPercent ?? 100} required /></FormField>
            <FormField label="Observações" className="sm:col-span-2"><Textarea name="notes" defaultValue={settings?.notes ?? ""} placeholder="Notas internas sobre tarifas ou política de preço" /></FormField>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-4"><SubmitButton><TbCheck /> Salvar configurações</SubmitButton></div>
        </form>
      ) : null}

      {activeTab === "resinas" ? (
        <div className="grid items-start gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form action={upsertResinAction} className="panel overflow-hidden xl:sticky xl:top-6">
            <input type="hidden" name="id" value={editResin?.id ?? ""} />
            <div className="border-b border-border px-5 py-4"><h2 className="font-display text-lg font-semibold">{editResin ? "Editar resina" : "Nova resina"}</h2><p className="mt-1 text-xs text-muted-foreground">O custo por ml é calculado automaticamente.</p></div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-2">
              <FormField label="Nome" className="sm:col-span-2"><Input name="name" defaultValue={editResin?.name ?? ""} required /></FormField>
              <FormField label="Fabricante"><Input name="manufacturer" defaultValue={editResin?.manufacturer ?? ""} /></FormField>
              <FormField label="Cor"><Input name="color" defaultValue={editResin?.color ?? ""} /></FormField>
              <FormField label="Preço pago"><Input name="purchasePrice" type="number" min="0" step="0.01" defaultValue={editResin?.purchasePrice ?? ""} required /></FormField>
              <FormField label="Unidade"><Select name="purchaseUnit" defaultValue={editResin?.purchaseUnit ?? "KG"}><option value="KG">kg</option><option value="G">g</option><option value="L">litro</option><option value="ML">ml</option></Select></FormField>
              <FormField label="Quantidade comprada"><Input name="purchaseQuantity" type="number" min="0.0001" step="0.0001" defaultValue={editResin?.purchaseQuantity ?? 1} required /></FormField>
              <FormField label="Densidade (g/ml)"><Input name="density" type="number" min="0.0001" step="0.0001" defaultValue={editResin?.density ?? ""} placeholder="Obrigatória para kg/g" /></FormField>
              <FormField label="Custo manual por ml" className="sm:col-span-2"><Input name="manualCostPerMl" type="number" min="0" step="0.000001" defaultValue={editResin?.manualCostPerMl ?? ""} placeholder="Opcional; substitui o calculado" /></FormField>
              {editResin ? <div className="sm:col-span-2 border-l-2 border-teal-500/50 bg-white/[0.02] p-3 text-xs text-muted-foreground">Custo calculado atual: <strong className="text-teal-300">{formatCurrency(editResin.calculatedCostPerMl)}/ml</strong></div> : null}
              <FormField label="Observações" className="sm:col-span-2"><Textarea name="notes" defaultValue={editResin?.notes ?? ""} className="min-h-20" /></FormField>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="isActive" defaultChecked={editResin?.isActive ?? true} className="accent-amber-500" /> Resina ativa</label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{editResin ? <Link href="/configuracoes?tab=resinas" className={cn(buttonVariants({ variant: "ghost" }))}>Cancelar</Link> : null}<SubmitButton><TbCheck /> {editResin ? "Salvar" : "Cadastrar"}</SubmitButton></div>
          </form>
          <div className="panel overflow-x-auto"><table className="data-table"><thead><tr><th>Resina</th><th>Compra</th><th>Custo por ml</th><th>Status</th><th className="text-right">Ações</th></tr></thead><tbody>{resins.map((resin) => <tr key={resin.id}><td><strong className="text-zinc-100">{resin.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{[resin.manufacturer, resin.color].filter(Boolean).join(" · ") || "Sem fabricante/cor"}</span></td><td className="text-muted-foreground">{formatCurrency(resin.purchasePrice)} · {resin.purchaseQuantity.toLocaleString("pt-BR")} {UNIT_LABELS[resin.purchaseUnit]}</td><td><span className="font-semibold tabular-nums text-primary">{formatCurrency(resin.manualCostPerMl ?? resin.calculatedCostPerMl)}</span>{resin.manualCostPerMl != null ? <span className="block text-[10px] text-muted-foreground">manual</span> : null}</td><td><Badge status={resin.isActive ? "PRODUCED" : "ARCHIVED"}>{resin.isActive ? "Ativa" : "Inativa"}</Badge></td><td><div className="flex justify-end gap-1"><Link href={`/configuracoes?tab=resinas&edit=${resin.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Editar"><TbEdit /></Link><form action={toggleResinAction}><input type="hidden" name="id" value={resin.id} /><SubmitButton variant="ghost" size="sm">{resin.isActive ? "Inativar" : "Ativar"}</SubmitButton></form><form action={deleteResinAction}><input type="hidden" name="id" value={resin.id} /><ConfirmSubmit size="icon" message={`Excluir a resina “${resin.name}”?`} aria-label="Excluir" /></form></div></td></tr>)}</tbody></table></div>
        </div>
      ) : null}

      {activeTab === "impressoras" ? (
        <div className="grid items-start gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form action={upsertPrinterAction} className="panel overflow-hidden xl:sticky xl:top-6"><input type="hidden" name="id" value={editPrinter?.id ?? ""} /><div className="border-b border-border px-5 py-4"><h2 className="font-display text-lg font-semibold">{editPrinter ? "Editar impressora" : "Nova impressora"}</h2><p className="mt-1 text-xs text-muted-foreground">A potência média define o custo de energia.</p></div><div className="grid gap-4 p-5"><FormField label="Nome"><Input name="name" defaultValue={editPrinter?.name ?? ""} required /></FormField><FormField label="Modelo"><Input name="model" defaultValue={editPrinter?.model ?? ""} /></FormField><FormField label="Potência média (W)"><Input name="powerWatts" type="number" min="0" step="0.01" defaultValue={editPrinter?.powerWatts ?? ""} required /></FormField><FormField label="Observações"><Textarea name="notes" defaultValue={editPrinter?.notes ?? ""} /></FormField><label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="isActive" defaultChecked={editPrinter?.isActive ?? true} className="accent-amber-500" /> Impressora ativa</label></div><div className="flex justify-end gap-2 border-t border-border px-5 py-4">{editPrinter ? <Link href="/configuracoes?tab=impressoras" className={cn(buttonVariants({ variant: "ghost" }))}>Cancelar</Link> : null}<SubmitButton><TbCheck /> {editPrinter ? "Salvar" : "Cadastrar"}</SubmitButton></div></form>
          <div className="panel overflow-x-auto"><table className="data-table"><thead><tr><th>Impressora</th><th>Potência</th><th>Status</th><th className="text-right">Ações</th></tr></thead><tbody>{printers.map((printer) => <tr key={printer.id}><td><strong className="text-zinc-100">{printer.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{printer.model || "Modelo não informado"}</span></td><td className="tabular-nums"><TbBolt className="mr-1 inline text-primary" />{printer.powerWatts.toLocaleString("pt-BR")} W</td><td><Badge status={printer.isActive ? "PRODUCED" : "ARCHIVED"}>{printer.isActive ? "Ativa" : "Inativa"}</Badge></td><td><div className="flex justify-end gap-1"><Link href={`/configuracoes?tab=impressoras&edit=${printer.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Editar"><TbEdit /></Link><form action={togglePrinterAction}><input type="hidden" name="id" value={printer.id} /><SubmitButton variant="ghost" size="sm">{printer.isActive ? "Inativar" : "Ativar"}</SubmitButton></form><form action={deletePrinterAction}><input type="hidden" name="id" value={printer.id} /><ConfirmSubmit size="icon" message={`Excluir a impressora “${printer.name}”?`} aria-label="Excluir" /></form></div></td></tr>)}</tbody></table></div>
        </div>
      ) : null}

      {activeTab === "acabamentos" ? (
        <div className="grid items-start gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form action={upsertFinishAction} className="panel overflow-hidden xl:sticky xl:top-6"><input type="hidden" name="id" value={editFinish?.id ?? ""} /><div className="border-b border-border px-5 py-4"><h2 className="font-display text-lg font-semibold">{editFinish ? "Editar acabamento" : "Novo acabamento"}</h2><p className="mt-1 text-xs text-muted-foreground">Presets rápidos para pintura e pós-processo.</p></div><div className="grid gap-4 p-5"><FormField label="Nome"><Input name="name" defaultValue={editFinish?.name ?? ""} required /></FormField><FormField label="Custo fixo"><Input name="fixedCost" type="number" min="0" step="0.01" defaultValue={editFinish?.fixedCost ?? ""} required /></FormField><FormField label="Descrição"><Textarea name="description" defaultValue={editFinish?.description ?? ""} /></FormField><label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="isActive" defaultChecked={editFinish?.isActive ?? true} className="accent-amber-500" /> Acabamento ativo</label></div><div className="flex justify-end gap-2 border-t border-border px-5 py-4">{editFinish ? <Link href="/configuracoes?tab=acabamentos" className={cn(buttonVariants({ variant: "ghost" }))}>Cancelar</Link> : null}<SubmitButton><TbCheck /> {editFinish ? "Salvar" : "Cadastrar"}</SubmitButton></div></form>
          <div className="panel overflow-x-auto"><table className="data-table"><thead><tr><th>Acabamento</th><th>Custo fixo</th><th>Status</th><th className="text-right">Ações</th></tr></thead><tbody>{finishes.map((finish) => <tr key={finish.id}><td><strong className="text-zinc-100">{finish.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{finish.description || "Sem descrição"}</span></td><td className="font-semibold tabular-nums text-primary">{formatCurrency(finish.fixedCost)}</td><td><Badge status={finish.isActive ? "PRODUCED" : "ARCHIVED"}>{finish.isActive ? "Ativo" : "Inativo"}</Badge></td><td><div className="flex justify-end gap-1"><Link href={`/configuracoes?tab=acabamentos&edit=${finish.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Editar"><TbEdit /></Link><form action={toggleFinishAction}><input type="hidden" name="id" value={finish.id} /><SubmitButton variant="ghost" size="sm">{finish.isActive ? "Inativar" : "Ativar"}</SubmitButton></form><form action={deleteFinishAction}><input type="hidden" name="id" value={finish.id} /><ConfirmSubmit size="icon" message={`Excluir o acabamento “${finish.name}”?`} aria-label="Excluir" /></form></div></td></tr>)}</tbody></table></div>
        </div>
      ) : null}
    </>
  );
}
