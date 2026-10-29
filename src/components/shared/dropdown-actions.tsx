"use client";

import { Fragment } from "react";
import Link from "next/link";

import type { MenuItem, MenuRendererProps } from "@/components/shared/menu-types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function renderItem(item: MenuItem) {
  const Icon = item.icon;
  switch (item.kind) {
    case "action":
      return (
        <DropdownMenuItem key={item.id} variant={item.destructive ? "destructive" : "default"} onSelect={item.onSelect}>
          <Icon />
          {item.label}
        </DropdownMenuItem>
      );
    case "toggle":
      return (
        <DropdownMenuCheckboxItem
          key={item.id}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          // Keep the menu open so the new state is visible.
          onSelect={(event) => event.preventDefault()}
        >
          {item.label}
        </DropdownMenuCheckboxItem>
      );
    case "link":
      return (
        <DropdownMenuItem key={item.id} asChild>
          <Link href={item.href}>
            <Icon />
            {item.label}
          </Link>
        </DropdownMenuItem>
      );
  }
}

/** Desktop rendering of a menu model: a Radix dropdown. */
export function DropdownActions({ trigger, title, header, groups, align = "end" }: MenuRendererProps) {
  const visible = groups.filter((group) => group.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56" aria-label={title}>
        {header && <div className="px-2 py-1.5 text-sm">{header}</div>}
        {visible.map((group, index) => (
          <Fragment key={group.id}>
            {(index > 0 || header) && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
              {group.items.map(renderItem)}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
