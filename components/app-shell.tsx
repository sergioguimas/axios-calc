"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  TbChartGridDots,
  TbFileInvoice,
  TbHistory,
  TbLogout,
  TbMenu2,
  TbSettings,
  TbShieldLock,
  TbX,
} from "react-icons/tb";
import { logoutAction } from "@/app/logout-action";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Visão geral", icon: TbChartGridDots, exact: true },
  { href: "/orcamentos/novo", label: "Novo orçamento", icon: TbFileInvoice },
  { href: "/orcamentos", label: "Histórico", icon: TbHistory, exact: true },
  { href: "/configuracoes", label: "Configurações", icon: TbSettings },
];

export type ShellUser = { username: string; role: string };

export function AppShell({ children, user }: { children: React.ReactNode; user: ShellUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = user.role === "ADMIN" ? [...navigation, { href: "/admin", label: "Admin", icon: TbShieldLock, exact: false }] : navigation;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <button
        type="button"
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-md border border-border bg-[#0a0f12] text-zinc-200 lg:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <TbX size={22} /> : <TbMenu2 size={22} />}
      </button>

      {open ? <button className="fixed inset-0 z-30 bg-black/70 lg:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)} /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[180px] flex-col border-r border-border bg-[#080d10] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[76px] items-center border-b border-border px-5">
          <Link href="/" onClick={() => setOpen(false)} className="leading-none">
            <span className="font-display text-xl font-bold uppercase tracking-tight text-white">Axios</span>
            <span className="ml-1 font-display text-xl font-bold uppercase tracking-tight text-primary">Calc</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Oficina de custos</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Navegação principal">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-2.5 border-l-2 pl-2.5 pr-2.5 text-[13px] transition",
                  active
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-zinc-400 hover:border-white/15 hover:text-zinc-100",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-400/10 font-bold uppercase text-teal-300">{user.username.slice(0, 2)}</span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-zinc-200">{user.username}</strong>
              {user.role === "ADMIN" ? "Administrador" : "Uso interno"}
            </span>
            <form action={logoutAction}>
              <button type="submit" aria-label="Sair" title="Sair" className="grid h-8 w-8 place-items-center text-zinc-400 transition hover:text-red-300">
                <TbLogout size={18} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[180px]">
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-10 pt-20 sm:px-6 lg:px-4 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
