import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell width="max-w-2xl">{children}</AppShell>
    </AuthGuard>
  );
}
