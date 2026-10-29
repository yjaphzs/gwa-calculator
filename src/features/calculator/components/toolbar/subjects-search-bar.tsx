"use client";

import type { ReactNode, RefObject } from "react";
import { CommandIcon, Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import { useIsMac } from "@/hooks/use-is-mac";

interface SubjectsSearchBarProps {
  filter: SubjectFilter;
  searchInputRef: RefObject<HTMLInputElement | null>;
  /** Rendered after the search box (the phone "⋯" sheet trigger). */
  trailing?: ReactNode;
}

/** Page-size picker and the subject search box with its result count. */
export function SubjectsSearchBar({ filter, searchInputRef, trailing }: SubjectsSearchBarProps) {
  const isMac = useIsMac();

  return (
    <div className="flex w-full justify-end gap-2">
      <Select
        value={String(filter.pageSize)}
        onValueChange={(value) => filter.setPageSize(Number(value))}
      >
        <SelectTrigger className="hidden w-20 md:flex" aria-label="Rows per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filter.pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <InputGroup className="ml-auto h-10 md:h-9">
        <InputGroupInput
          ref={searchInputRef}
          placeholder="Search subjects..."
          aria-label="Search subjects"
          value={filter.search}
          onChange={(e) => filter.setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="text-muted-foreground">
          {filter.filtered.length} results
          <KbdGroup className="hidden sm:inline-flex" aria-label={`Shortcut: ${isMac ? "Command" : "Control"} K`}>
            <Kbd>{isMac ? <CommandIcon /> : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
      {trailing}
    </div>
  );
}
