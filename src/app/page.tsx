import type { Metadata } from "next";

import { CalculatorView } from "@/features/calculator/components/calculator-view";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <CalculatorView />;
}
