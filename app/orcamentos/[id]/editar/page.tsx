import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateQuoteAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "@/components/quote-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar orçamento" };
export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const [quote, settings, resins, printers, finishes] = await Promise.all([
    prisma.quote.findUnique({ where: { id } }),
    prisma.appSettings.findUnique({ where: { id: 1 } }),
    prisma.resin.findMany({ where: { OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: { name: "asc" } }),
    prisma.printer.findMany({ where: { OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: { name: "asc" } }),
    prisma.finishPreset.findMany({ where: { OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: [{ fixedCost: "asc" }, { name: "asc" }] }),
  ]);
  if (!quote) notFound();
  const action = updateQuoteAction.bind(null, quote.id);
  const appSettings = settings ?? { kwhCost: 1.14, defaultProfitPercent: 100, currency: "BRL" };

  return (
    <>
      <PageHeader eyebrow={`Orçamento #${String(quote.id).padStart(4, "0")}`} title="Editar orçamento" description="A atualização recalcula os custos usando os cadastros selecionados e grava novos snapshots." />
      <QuoteForm
        action={action}
        settings={{ kwhCost: appSettings.kwhCost, defaultProfitPercent: appSettings.defaultProfitPercent, currency: appSettings.currency }}
        resins={resins.map(({ id, name, calculatedCostPerMl, manualCostPerMl }) => ({ id, name, calculatedCostPerMl, manualCostPerMl }))}
        printers={printers.map(({ id, name, powerWatts, model }) => ({ id, name, powerWatts, model }))}
        finishes={finishes.map(({ id, name, fixedCost, description }) => ({ id, name, fixedCost, description }))}
        initial={{
          modelName: quote.modelName,
          customerName: quote.customerName,
          description: quote.description,
          quantity: quote.quantity,
          status: quote.status,
          driveLink: quote.driveLink,
          notes: quote.notes,
          freightNotes: quote.freightNotes,
          heightMm: quote.heightMm,
          widthMm: quote.widthMm,
          depthMm: quote.depthMm,
          resinMl: quote.resinMl,
          printTimeMinutes: quote.printTimeMinutes,
          resinId: quote.resinId,
          printerId: quote.printerId,
          finishPresetId: quote.finishPresetId,
          freightCost: quote.freightCost,
          pricingMode: quote.pricingMode,
          profitPercent: quote.profitPercent,
          finalPrice: quote.finalPrice,
        }}
      />
    </>
  );
}
