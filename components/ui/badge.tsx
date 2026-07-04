import * as React from "react";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  QUOTE: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  APPROVED: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  PRODUCED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  CANCELED: "border-red-500/25 bg-red-500/10 text-red-300",
  ARCHIVED: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
};

export function Badge({ className, status, ...props }: React.ComponentProps<"span"> & { status?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        status ? tones[status] : tones.ARCHIVED,
        className,
      )}
      {...props}
    />
  );
}
