"use client";

import { ActionSheet } from "@/components/shared/action-sheet";
import { DropdownActions } from "@/components/shared/dropdown-actions";
import type { MenuRendererProps } from "@/components/shared/menu-types";
import { useIsMobile } from "@/hooks/use-media-query";

interface ResponsiveMenuProps extends MenuRendererProps {
  /**
   * "auto" picks by screen size when opened. Use "menu"/"sheet" when the
   * trigger itself only shows at one breakpoint (avoids a JS check).
   */
  mode?: "auto" | "menu" | "sheet";
}

/** One menu model: a dropdown on desktop, a bottom action sheet on phones. */
export function ResponsiveMenu({ mode = "auto", ...props }: ResponsiveMenuProps) {
  const isMobile = useIsMobile();
  const asSheet = mode === "sheet" || (mode === "auto" && isMobile);
  return asSheet ? <ActionSheet {...props} /> : <DropdownActions {...props} />;
}
