"use client";

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

interface AvatarCropDialogProps {
  /** The picked image; the dialog is open while this is set. */
  file: File | null;
  aspect: number;
  maxImageSize: number;
  outputType: "image/png" | "image/jpeg" | "image/webp";
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}

/** Crop the picked photo before it's uploaded. */
export function AvatarCropDialog({
  file,
  aspect,
  maxImageSize,
  outputType,
  onApply,
  onCancel,
}: AvatarCropDialogProps) {
  return (
    <Dialog open={!!file} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop photo</DialogTitle>
          <DialogDescription>
            Drag the corners to frame your photo. The selected area becomes your profile picture.
          </DialogDescription>
        </DialogHeader>
        {file && (
          <ImageCrop
            file={file}
            aspect={aspect}
            circularCrop={aspect === 1}
            maxImageSize={maxImageSize}
            outputType={outputType}
            onCrop={onApply}
          >
            <div className="flex flex-col items-center gap-3">
              <ImageCropContent />
              <div className="flex items-center gap-2">
                <ImageCropReset />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <ImageCropApply>Apply</ImageCropApply>
            </DialogFooter>
          </ImageCrop>
        )}
      </DialogContent>
    </Dialog>
  );
}
