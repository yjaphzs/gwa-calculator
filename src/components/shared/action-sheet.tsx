"use client";

import { useState } from "react";
import Link from "next/link";

import type { MenuItem, MenuRendererProps } from "@/components/shared/menu-types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ROW = "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-accent active:bg-accent focus-visible:bg-accent focus-visible:outline-none";

function SheetItem({ item, close }: { item: MenuItem; close: () => void }) {
  const Icon = item.icon;
  const icon = <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />;

  switch (item.kind) {
    case "action":
      return (
        <button
          type="button"
          className={cn(ROW, item.destructive && "text-destructive [&_svg]:text-destructive")}
          onClick={() => {
            close();
            item.onSelect();
          }}
        >
          {icon}
          {item.label}
        </button>
      );
    case "toggle":
      return (
        <label className={cn(ROW, "cursor-pointer justify-between")}>
          <span className="flex items-center gap-3">
            {icon}
            <span className="flex flex-col">
              {item.label}
              {item.hint && <span className="text-xs font-normal text-muted-foreground">{item.hint}</span>}
            </span>
          </span>
          <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} aria-label={item.label} />
        </label>
      );
    case "link":
      return (
        <DrawerClose asChild>
          <Link href={item.href} className={ROW}>
            {icon}
            {item.label}
          </Link>
        </DrawerClose>
      );
  }
}

/** Phone rendering of a menu model: a bottom sheet of large, labelled rows. */
export function ActionSheet({ trigger, title, description, header, groups }: MenuRendererProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const visible = groups.filter((group) => group.items.length > 0);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          {header ?? <DrawerTitle>{title}</DrawerTitle>}
          {header && <DrawerTitle className="sr-only">{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {visible.map((group, index) => (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className={cn("flex flex-col", index > 0 && "mt-1 border-t pt-1")}
            >
              {group.label && (
                <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
              )}
              {group.items.map((item) => (
                <SheetItem key={item.id} item={item} close={close} />
              ))}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
