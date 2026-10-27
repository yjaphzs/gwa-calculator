import { GuideSection } from "@/features/guide/components/guide-section";

const STEPS = [
  {
    title: "List your subjects",
    body: "Write down each subject's final grade and its units. Leave out subjects your school doesn't count, such as NSTP.",
  },
  {
    title: "Multiply each grade by its units",
    body: "This gives each subject's weighted grade. A 1.25 in a 3-unit subject is 3.75.",
  },
  {
    title: "Add up both columns",
    body: "Total the weighted grades, then total the units.",
  },
  {
    title: "Divide and round",
    body: "Divide the weighted total by the unit total and round to three decimal places.",
  },
];

export function StepsSection() {
  return (
    <GuideSection id="steps" title="Compute it in four steps">
      <ol className="mt-5 grid gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="mt-1!">{step.title}</h3>
              <p className="mt-1!">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </GuideSection>
  );
}
