import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";

// Mirrors the (auth) split-screen layout, but WITHOUT GuestGuard — account
// actions (verify email / reset password) must work whether the user is signed
// in or not.
export default function AuthActionLayout({ children }: { children: React.ReactNode }) {
  return <AuthSplitLayout contentClassName="w-full max-w-sm">{children}</AuthSplitLayout>;
}
