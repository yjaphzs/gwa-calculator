"use client";

import * as React from "react";
import { CameraIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/ui/image-crop";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface AvatarCropperFieldProps {
  /** The currently-shown photo URL (e.g. from Firebase Storage). */
  currentUrl?: string | null;
  /** Initials shown in the fallback Avatar. */
  initials?: string;
  /** Called when a crop is applied — receives the cropped Blob. */
  onCrop: (blob: Blob) => void | Promise<void>;
  /** Aspect ratio for the crop frame. Defaults to 1 (square avatar). */
  aspect?: number;
  /** Max output size in bytes — defaults to 2 MB. */
  maxImageSize?: number;
  /** Output mime type — defaults to image/jpeg. */
  outputType?: "image/png" | "image/jpeg" | "image/webp";
  /** Help text shown beneath the picker. */
  helperText?: string;
  /** True while the cropped image is uploading. */
  busy?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AvatarCropperField({
  currentUrl,
  initials = "?",
  onCrop,
  aspect = 1,
  maxImageSize = 2 * 1024 * 1024,
  outputType = "image/jpeg",
  helperText = "JPG, PNG, or WEBP. Max 5 MB — you'll crop it next.",
  busy = false,
  disabled,
  className,
}: AvatarCropperFieldProps) {
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isDisabled = disabled || busy;

  function handlePick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is larger than 5 MB. Please choose a smaller file.");
      return;
    }
    setPendingFile(file);
    setDialogOpen(true);
  }

  async function handleApply(blob: Blob) {
    setDialogOpen(false);
    setPendingFile(null);
    await onCrop(blob);
  }

  function handleCancel() {
    setDialogOpen(false);
    setPendingFile(null);
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={handlePick}
        disabled={isDisabled}
        className={cn(
          "group relative shrink-0 rounded-full outline-none transition-shadow",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
        aria-label="Change profile photo"
      >
        <Avatar className="size-20 ring-2 ring-border">
          {currentUrl && <AvatarImage src={currentUrl} alt="Profile photo" />}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? (
            <Spinner className="size-6 text-white" />
          ) : (
            <CameraIcon className="size-6 text-white" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePick}
          disabled={isDisabled}
        >
          {busy ? <Spinner data-icon="inline-start" /> : <CameraIcon />}
          {busy ? "Uploading…" : currentUrl ? "Change photo" : "Upload photo"}
        </Button>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!next) handleCancel();
          else setDialogOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
            <DialogDescription>
              Drag the corners to frame your photo. The selected area becomes
              your profile picture.
            </DialogDescription>
          </DialogHeader>
          {pendingFile && (
            <ImageCrop
              file={pendingFile}
              aspect={aspect}
              circularCrop={aspect === 1}
              maxImageSize={maxImageSize}
              outputType={outputType}
              onCrop={(blob) => handleApply(blob)}
            >
              <div className="flex flex-col items-center gap-3">
                <ImageCropContent />
                <div className="flex items-center gap-2">
                  <ImageCropReset />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <ImageCropApply>Apply</ImageCropApply>
              </DialogFooter>
            </ImageCrop>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
