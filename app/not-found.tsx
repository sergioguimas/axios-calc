import Link from "next/link";
import { TbArrowLeft, TbFileOff } from "react-icons/tb";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return <div className="mx-auto mt-24 max-w-lg text-center"><TbFileOff className="mx-auto text-primary" size={42} /><h1 className="mt-5 font-display text-3xl font-semibold">Registro não encontrado</h1><p className="mt-2 text-sm text-muted-foreground">O orçamento solicitado não existe ou já foi removido.</p><Link href="/orcamentos" className={cn(buttonVariants(), "mt-6")}><TbArrowLeft /> Voltar ao histórico</Link></div>;
}
