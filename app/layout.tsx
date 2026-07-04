import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Axios Calc", template: "%s · Axios Calc" },
  description: "Custos e orçamentos para impressão 3D em resina.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
