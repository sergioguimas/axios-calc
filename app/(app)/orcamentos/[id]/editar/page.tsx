import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateQuoteAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "@/components/quote-form";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar orçamento" };
export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id: rawId } = await params;
  const id = Number(rawId);
  const [quote, settings, resins, filaments, printers, finishes] = await Promise.all([
    prisma.quote.findFirst({ where: { id, userId: session.id } }),
    prisma.appSettings.findUnique({ where: { userId: session.id } }),
    prisma.resin.findMany({ where: { userId: session.id, OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: { name: "asc" } }),
    prisma.filament.findMany({ where: { userId: session.id, OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: { name: "asc" } }),
    prisma.printer.findMany({ where: { userId: session.id, OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: { name: "asc" } }),
    prisma.finishPreset.findMany({ where: { userId: session.id, OR: [{ isActive: true }, { quotes: { some: { id } } }] }, orderBy: [{ fixedCost: "asc" }, { name: "asc" }] }),
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
        filaments={filaments.map(({ id, name, calculatedCostPerGram, manualCostPerGram }) => ({ id, name, calculatedCostPerGram, manualCostPerGram }))}
        printers={printers.map(({ id, name, powerWatts, model, type }) => ({ id, name, powerWatts, model, type }))}
        finishes={finishes.map(({ id, name, fixedCost, description }) => ({ id, name, fixedCost, description }))}
        initial={{
          modelName: quote.modelName,
          customerName: quote.customerName,
          description: quote.description,
          quantity: quote.quantity,
          status: quote.status,
          materialType: quote.materialType,
          driveLink: quote.driveLink,
          notes: quote.notes,
          freightNotes: quote.freightNotes,
          heightMm: quote.heightMm,
          widthMm: quote.widthMm,
          depthMm: quote.depthMm,
          resinMl: quote.resinMl,
          filamentGrams: quote.filamentGrams,
          printTimeMinutes: quote.printTimeMinutes,
          resinId: quote.resinId,
          filamentId: quote.filamentId,
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
