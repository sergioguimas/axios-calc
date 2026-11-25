import { SolaSeal } from "@/components/sola-seal";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {children}
      <SolaSeal className="absolute bottom-6 left-1/2 -translate-x-1/2" />
    </div>
  );
}
