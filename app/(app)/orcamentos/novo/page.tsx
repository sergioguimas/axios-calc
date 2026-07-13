import type { Metadata } from "next";
import { createQuoteAction } from "@/app/actions";
import { QuoteForm } from "@/components/quote-form";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Novo orçamento" };
export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const session = await requireSession();
  const [settings, resins, printers, finishes] = await Promise.all([
    prisma.appSettings.findUnique({ where: { userId: session.id } }),
    prisma.resin.findMany({ where: { userId: session.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.printer.findMany({ where: { userId: session.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.finishPreset.findMany({ where: { userId: session.id, isActive: true }, orderBy: [{ fixedCost: "asc" }, { name: "asc" }] }),
  ]);

  const appSettings = settings ?? { kwhCost: 1.14, defaultProfitPercent: 100, currency: "BRL" };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">Novo orçamento</h1>
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-white/[0.025] px-3 py-1.5 text-sm text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-primary" /> Orçamento
        </span>
      </div>
      <QuoteForm
        action={createQuoteAction}
        settings={{ kwhCost: appSettings.kwhCost, defaultProfitPercent: appSettings.defaultProfitPercent, currency: appSettings.currency }}
        resins={resins.map(({ id, name, calculatedCostPerMl, manualCostPerMl }) => ({ id, name, calculatedCostPerMl, manualCostPerMl }))}
        printers={printers.map(({ id, name, powerWatts, model }) => ({ id, name, powerWatts, model }))}
        finishes={finishes.map(({ id, name, fixedCost, description }) => ({ id, name, fixedCost, description }))}
      />
    </>
  );
}
