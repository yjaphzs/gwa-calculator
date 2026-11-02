import { CardTemplate } from "@/features/share/components/templates/card-template";
import { ClassicTemplate } from "@/features/share/components/templates/classic-template";
import { PassTemplate } from "@/features/share/components/templates/pass-template";
import { ReceiptTemplate } from "@/features/share/components/templates/receipt-template";
import type { ShareTemplateProps } from "@/features/share/components/templates/template-props";

export type { ShareTemplateProps } from "@/features/share/components/templates/template-props";

/** The share image in the chosen style. Every style keeps "Unofficial, just for fun" in its footer. */
export function ShareTemplate(props: ShareTemplateProps) {
  switch (props.options.style) {
    case "receipt":
      return <ReceiptTemplate {...props} />;
    case "card":
      return <CardTemplate {...props} />;
    case "pass":
      return <PassTemplate {...props} />;
    default:
      return <ClassicTemplate {...props} />;
  }
}
