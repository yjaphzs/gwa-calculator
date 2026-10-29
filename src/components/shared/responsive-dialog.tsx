"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

// Tasks (forms, pickers, long content) open as a bottom sheet on phones and a
// centered dialog from md up. Decisions stay AlertDialogs everywhere.
const AsDrawer = createContext(false);

interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const Root = isMobile ? Drawer : Dialog;
  return (
    <AsDrawer.Provider value={isMobile}>
      <Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </AsDrawer.Provider>
  );
}

export function ResponsiveDialogTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return useContext(AsDrawer) ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />;
}

interface ContentProps {
  children: ReactNode;
  /** Applied to the desktop dialog (e.g. a max width). */
  className?: string;
  /** Applied to the mobile sheet. */
  drawerClassName?: string;
  showCloseButton?: boolean;
}

export function ResponsiveDialogContent({ children, className, drawerClassName, showCloseButton }: ContentProps) {
  return useContext(AsDrawer) ? (
    <DrawerContent className={drawerClassName}>{children}</DrawerContent>
  ) : (
    <DialogContent className={className} showCloseButton={showCloseButton}>
      {children}
    </DialogContent>
  );
}

export function ResponsiveDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return useContext(AsDrawer) ? (
    <DrawerHeader className={cn("text-left", className)} {...props} />
  ) : (
    <DialogHeader className={className} {...props} />
  );
}

export function ResponsiveDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  return useContext(AsDrawer) ? <DrawerTitle {...props} /> : <DialogTitle {...props} />;
}

export function ResponsiveDialogDescription(props: ComponentProps<typeof DialogDescription>) {
  return useContext(AsDrawer) ? <DrawerDescription {...props} /> : <DialogDescription {...props} />;
}

/** The scrolling middle of the sheet; a plain block in the desktop dialog. */
export function ResponsiveDialogBody({ className, ...props }: ComponentProps<"div">) {
  const drawer = useContext(AsDrawer);
  return <div className={cn(drawer && "min-h-0 flex-1 overflow-y-auto px-4 pb-2", className)} {...props} />;
}

/** Desktop: right-aligned row. Sheet: full-width stack pinned above the safe area. */
export function ResponsiveDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return useContext(AsDrawer) ? (
    <DrawerFooter className={cn("border-t", className)} {...props} />
  ) : (
    <DialogFooter className={className} {...props} />
  );
}

export function ResponsiveDialogClose(props: ComponentProps<typeof DialogClose>) {
  return useContext(AsDrawer) ? <DrawerClose {...props} /> : <DialogClose {...props} />;
}

/** Whether the surrounding ResponsiveDialog renders as a sheet (e.g. to reorder footer buttons). */
export function useResponsiveDialogIsDrawer(): boolean {
  return useContext(AsDrawer);
}
