import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Phone-only floating "Add subject" pill, parked above the bottom tab bar. */
export function AddSubjectFab({ onAdd }: { onAdd: () => void }) {
  return (
    <Button
      onClick={onAdd}
      className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 h-12 rounded-full px-5 shadow-lg md:hidden"
    >
      <PlusIcon className="size-5" />
      Add subject
    </Button>
  );
}
