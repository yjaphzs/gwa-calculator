"use client";

import { useState } from "react";
import { PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppearanceDialog } from "@/features/appearance/components/appearance-dialog";

/** App-bar button for the Appearance settings (mode and color scheme). */
export function AppearanceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Appearance" onClick={() => setOpen(true)}>
        <PaletteIcon />
      </Button>
      <AppearanceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
