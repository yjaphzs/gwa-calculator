import type { Metadata } from "next";
import { Suspense } from "react";
import { ActionHandler } from "./_components/action-handler";

export const metadata: Metadata = {
  title: "Account action",
};

export default function AuthActionPage() {
  return (
    <Suspense fallback={null}>
      <ActionHandler />
    </Suspense>
  );
}
