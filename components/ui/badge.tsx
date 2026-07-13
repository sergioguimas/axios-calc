import * as React from "react";
import { cn } from "@/lib/utils";

const tones: Record<string, { dot: string; text: string }> = {
  QUOTE: { dot: "bg-amber-400", text: "text-amber-300" },
  APPROVED: { dot: "bg-sky-400", text: "text-sky-300" },
  PRODUCED: { dot: "bg-emerald-400", text: "text-emerald-300" },
  CANCELED: { dot: "bg-red-400", text: "text-red-300" },
  ARCHIVED: { dot: "bg-zinc-500", text: "text-zinc-400" },
};

export function Badge({ className, status, children, ...props }: React.ComponentProps<"span"> & { status?: string }) {
  const tone = (status && tones[status]) || tones.ARCHIVED;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider", tone.text, className)}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)} aria-hidden="true" />
      {children}
    </span>
  );
}
