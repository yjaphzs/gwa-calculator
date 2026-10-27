export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: readonly Faq[] = [
  {
    question: "Is a lower GWA better?",
    answer:
      "Yes. On the 1.00–5.00 scale, 1.00 is the highest grade and 3.00 is usually the lowest passing grade, so a smaller GWA means better standing.",
  },
  {
    question: "What GWA do I need for honors?",
    answer:
      "In this calculator, a semester GWA of 2.00 or better earns Dean's Lister, 1.75 or better College Scholar, and 1.50 or better University Scholar, once you have at least 12 units. Your school may use different cutoffs, so check its student handbook.",
  },
  {
    question: "Why doesn't my result match my school's exactly?",
    answer:
      "Small differences usually come from rounding (some schools round to two decimals or truncate instead of rounding to three), subjects your school leaves out such as NSTP, or a slightly different grade scale.",
  },
  {
    question: "Is my cumulative GWA the average of my semester GWAs?",
    answer:
      "No. The cumulative GWA weighs every subject from every semester by its units, so a semester with more units counts for more. Averaging the semester GWAs gives the wrong answer whenever your loads differ.",
  },
  {
    question: "Do failed subjects count?",
    answer:
      "Usually yes. A 5.00 is computed with its units like any other grade. If you retake the subject, schools differ on whether both attempts count, so follow your registrar's rule.",
  },
  {
    question: "What about INC, DRP, or W?",
    answer:
      "These aren't numeric grades, so they don't count until they're resolved. In the calculator, set the subject's status to INC, DRP, or W to keep it on your list without affecting your GWA, then change it to its final grade once you have one.",
  },
  {
    question: "Does the example calculator on this page save anything?",
    answer:
      "No. It only runs in your browser and resets when you leave. To keep your grades, use the main calculator. It saves to this browser, or to your account if you sign in.",
  },
];
