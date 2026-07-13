import type { Metadata } from "next";
import { TbCheck, TbLock, TbLockOpen, TbUserPlus } from "react-icons/tb";
import { createUserAction, toggleUserStatusAction, updateUserSubscriptionAction } from "./actions";
import { SubmitButton } from "@/components/form-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Administração" };
export const dynamic = "force-dynamic";

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label>{children}</div>;
}

function subscriptionInfo(endsAt: Date | null) {
  if (!endsAt) return { text: "Sem prazo definido", tone: "text-muted-foreground" };
  const days = Math.ceil((endsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return { text: `Expirado há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`, tone: "text-red-300" };
  if (days === 0) return { text: "Expira hoje", tone: "text-amber-300" };
  return { text: `${days} dia${days === 1 ? "" : "s"} restantes`, tone: "text-teal-300" };
}

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function Feedback({ params }: { params: Record<string, string | undefined> }) {
  if (params.error) return <div className="mb-4 border-l-2 border-red-500/60 bg-white/[0.02] px-4 py-3 text-sm text-red-300">{params.error}</div>;
  if (params.created) return <div className="mb-4 flex items-center gap-2 border-l-2 border-teal-500/60 bg-white/[0.02] px-4 py-3 text-sm text-teal-300"><TbCheck size={16} /> Usuário criado.</div>;
  return null;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await requireAdmin();
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageHeader eyebrow="Controle de acesso" title="Usuários" description="Gerencie contas, assinaturas e bloqueios." />

      <Feedback params={params} />

      <div className="grid items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form action={createUserAction} className="panel overflow-hidden xl:sticky xl:top-6">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Novo usuário</h2>
            <p className="mt-1 text-xs text-muted-foreground">A conta nasce com {30} dias de teste, ajustáveis depois.</p>
          </div>
          <div className="grid gap-4 p-5">
            <FormField label="Usuário"><Input name="username" placeholder="nome.sobrenome" required /></FormField>
            <FormField label="Senha"><Input name="password" type="password" required /></FormField>
            <FormField label="Papel"><Select name="role" defaultValue="USER"><option value="USER">Usuário</option><option value="ADMIN">Administrador</option></Select></FormField>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-4"><SubmitButton><TbUserPlus /> Cadastrar</SubmitButton></div>
        </form>

        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Status</th>
                <th>Assinatura</th>
                <th>Último acesso</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const info = subscriptionInfo(user.subscriptionEndsAt);
                const isSelf = user.id === session.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <strong className="text-zinc-100">{user.username}</strong>
                      <span className="mt-1 block text-xs text-muted-foreground">{user.role === "ADMIN" ? "Administrador" : "Usuário"}</span>
                    </td>
                    <td><Badge status={user.status}>{user.status === "ACTIVE" ? "Ativo" : "Bloqueado"}</Badge></td>
                    <td>
                      <span className={`block text-xs ${info.tone}`}>{info.text}</span>
                      <form action={updateUserSubscriptionAction} className="mt-1.5 flex items-center gap-1.5">
                        <input type="hidden" name="id" value={user.id} />
                        <Input type="date" name="subscriptionEndsAt" defaultValue={toDateInputValue(user.subscriptionEndsAt)} className="h-8 w-[150px] text-xs" />
                        <SubmitButton variant="ghost" size="icon" title="Salvar prazo" aria-label="Salvar prazo" className="h-8 w-8"><TbCheck size={16} /></SubmitButton>
                      </form>
                    </td>
                    <td className="text-xs text-muted-foreground">{user.lastLoginAt ? user.lastLoginAt.toLocaleString("pt-BR") : "Nunca acessou"}</td>
                    <td>
                      <div className="flex justify-end">
                        <form action={toggleUserStatusAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <SubmitButton
                            variant="ghost"
                            size="sm"
                            disabled={isSelf}
                            title={isSelf ? "Você não pode bloquear a própria conta" : user.status === "ACTIVE" ? "Bloquear" : "Desbloquear"}
                          >
                            {user.status === "ACTIVE" ? <TbLock size={16} /> : <TbLockOpen size={16} />}
                            {user.status === "ACTIVE" ? "Bloquear" : "Desbloquear"}
                          </SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
