import type { LucideIcon } from "lucide-react";

/** One entry in a menu that renders as a dropdown (desktop) or an action sheet (phone). */
export type MenuItem =
  | {
      kind: "action";
      id: string;
      label: string;
      icon: LucideIcon;
      onSelect: () => void;
      destructive?: boolean;
    }
  | {
      kind: "toggle";
      id: string;
      label: string;
      icon: LucideIcon;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      /** Short hint under the label in the sheet, e.g. what turning it off means. */
      hint?: string;
    }
  | { kind: "link"; id: string; label: string; icon: LucideIcon; href: string };

export interface MenuGroup {
  id: string;
  label?: string;
  items: MenuItem[];
}

export interface MenuRendererProps {
  /** The element that opens the menu (rendered with asChild). */
  trigger: React.ReactElement;
  /** Sheet heading; also the accessible name of the menu. */
  title: string;
  description?: string;
  /** Replaces the default title block (e.g. the account summary). */
  header?: React.ReactNode;
  groups: MenuGroup[];
  align?: "start" | "end";
}
