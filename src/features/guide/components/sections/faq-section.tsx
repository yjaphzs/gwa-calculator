import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GuideSection } from "@/features/guide/components/guide-section";
import { FAQS } from "@/features/guide/content/faqs";

export function FaqSection() {
  return (
    <GuideSection id="faq" title="Common questions">
      <Accordion type="single" collapsible className="mt-4 rounded-lg border px-4">
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="text-base">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="mt-0!">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </GuideSection>
  );
}
