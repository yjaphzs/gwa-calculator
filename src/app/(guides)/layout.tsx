import { ContentPageLayout, PROSE } from "@/components/layout/content-page-layout";

// Guides read like a study handbook: serif headings over the shared prose.
const GUIDE_PROSE = `${PROSE} [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif`;

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <ContentPageLayout articleClassName={GUIDE_PROSE}>{children}</ContentPageLayout>;
}
