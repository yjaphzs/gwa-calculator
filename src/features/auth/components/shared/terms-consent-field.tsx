import Link from "next/link";
import type { FieldError as RHFFieldError, UseFormRegisterReturn } from "react-hook-form";

import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const LINK_CLASS = "font-medium text-foreground underline underline-offset-4 hover:text-primary";

interface TermsConsentFieldProps {
  registration: UseFormRegisterReturn;
  error?: RHFFieldError;
  disabled: boolean;
}

/** Consent checkbox — required before creating an account by any method. */
export function TermsConsentField({ registration, error, disabled }: TermsConsentFieldProps) {
  return (
    <div>
      <label
        htmlFor="register-accept-terms"
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-relaxed text-muted-foreground transition-colors",
          "has-checked:border-primary/40 has-checked:bg-primary/5",
          error ? "border-destructive" : "border-input",
        )}
      >
        <input
          id="register-accept-terms"
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
          disabled={disabled}
          {...registration}
        />
        <span>
          I agree to the{" "}
          <Link href="/terms-and-conditions" className={LINK_CLASS}>
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className={LINK_CLASS}>
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <FieldError errors={[error]} className="mt-1.5" />
    </div>
  );
}
