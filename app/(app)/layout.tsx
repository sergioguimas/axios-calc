import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell user={session}>{children}</AppShell>;
}
