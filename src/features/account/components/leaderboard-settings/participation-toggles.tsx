import { Switch } from "@/components/ui/switch";

interface ToggleRowProps {
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ label, hint, checked, disabled, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}

interface ParticipationTogglesProps {
  optIn: boolean;
  anonymous: boolean;
  busy: boolean;
  verified: boolean;
  hasSavedSchool: boolean;
  onToggleJoin: (next: boolean) => void;
  onToggleAnonymous: (next: boolean) => void;
}

/** "Join the leaderboard" and "Show me as anonymous" switches. */
export function ParticipationToggles({
  optIn,
  anonymous,
  busy,
  verified,
  hasSavedSchool,
  onToggleJoin,
  onToggleAnonymous,
}: ParticipationTogglesProps) {
  return (
    <>
      <ToggleRow
        label="Join the leaderboard"
        hint={
          hasSavedSchool
            ? "Publish your standing to your school's board."
            : "Choose and save your school first."
        }
        checked={optIn}
        disabled={busy || !verified || !hasSavedSchool}
        onCheckedChange={onToggleJoin}
      />
      <ToggleRow
        label="Show me as anonymous"
        hint="Hide your name and photo behind a random handle."
        checked={anonymous}
        disabled={busy || !verified}
        onCheckedChange={onToggleAnonymous}
      />
    </>
  );
}
