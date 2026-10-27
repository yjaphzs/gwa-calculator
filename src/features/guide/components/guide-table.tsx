import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface GuideColumn {
  label: string;
  /** Right-aligned monospace figures (grades, units, GWA). */
  numeric?: boolean;
}

interface GuideTableProps {
  caption: string;
  columns: GuideColumn[];
  rows: ReactNode[][];
  footer?: ReactNode[];
}

/** Bordered reference table used throughout the guide. */
export function GuideTable({ caption, columns, rows, footer }: GuideTableProps) {
  const cellClass = (i: number) =>
    cn("whitespace-normal", columns[i]?.numeric && "text-right font-mono tabular-nums");

  return (
    <div className="mt-4 overflow-hidden rounded-lg border">
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {columns.map((column, i) => (
              <TableHead key={column.label} className={cn("px-3", cellClass(i))}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, r) => (
            <TableRow key={r}>
              {row.map((cell, i) => (
                <TableCell key={i} className={cn("px-3 py-2.5", cellClass(i))}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footer && (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              {footer.map((cell, i) => (
                <TableCell key={i} className={cn("px-3 py-2.5 font-semibold", cellClass(i))}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
