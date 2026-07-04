"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  TbChartGridDots,
  TbChevronRight,
  TbFileInvoice,
  TbHistory,
  TbMenu2,
  TbSettings,
  TbX,
} from "react-icons/tb";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Visão geral", icon: TbChartGridDots, exact: true },
  { href: "/orcamentos/novo", label: "Novo orçamento", icon: TbFileInvoice },
  { href: "/orcamentos", label: "Histórico", icon: TbHistory, exact: true },
  { href: "/configuracoes", label: "Configurações", icon: TbSettings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          {navigation.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex h-11 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition",
                  active ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
                )}
              >
                {active ? <span className="absolute -left-3 h-7 w-0.5 bg-primary" /> : null}
                <Icon size={21} strokeWidth={1.6} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-md px-2 py-3 text-xs text-muted-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-400/10 font-bold text-teal-300">AC</span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-zinc-200">Axios Calc</strong>Uso interno</span>
            <TbChevronRight />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[180px]">
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-10 pt-20 sm:px-6 lg:px-4 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
