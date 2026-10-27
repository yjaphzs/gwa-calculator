import { GoogleIcon } from "@/components/shared/google-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface GoogleSignInButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GoogleSignInButton({ loading, disabled, onClick }: GoogleSignInButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={disabled}>
      {loading ? <Spinner data-icon="inline-start" /> : <GoogleIcon className="size-4" />}
      Continue with Google
    </Button>
  );
}
