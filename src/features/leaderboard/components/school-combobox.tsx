"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { SCHOOLS, getSchoolById, type School } from "@/config/schools";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const UNIVERSITIES = SCHOOLS.filter((s) => s.type === "university");
const COLLEGES = SCHOOLS.filter((s) => s.type === "college");

interface SchoolComboboxProps {
  /** Currently selected school id, or null when none is chosen. */
  value: string | null;
  onChange: (school: School | null) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

/**
 * Searchable picker over the curated {@link SCHOOLS} list, grouped into
 * universities and colleges. Calls `onChange` with the full {@link School} so
 * callers can denormalize its name + type onto the profile.
 */
export function SchoolCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Select your school…",
  id,
  className,
}: SchoolComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = getSchoolById(value);

  function handleSelect(school: School) {
    onChange(school.id === value ? null : school);
    setOpen(false);
  }

  function renderItem(school: School) {
    const isSelected = school.id === value;
    return (
      <CommandItem
        key={school.id}
        value={school.name}
        onSelect={() => handleSelect(school)}
      >
        <CheckIcon
          className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")}
        />
        {school.name}
      </CommandItem>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search schools…" />
          <CommandList>
            <CommandEmpty>No school found.</CommandEmpty>
            <CommandGroup heading="Universities">
              {UNIVERSITIES.map(renderItem)}
            </CommandGroup>
            <CommandGroup heading="Colleges">
              {COLLEGES.map(renderItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
