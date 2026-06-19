"use client";

import { CropIcon, RotateCcwIcon } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
  type ReactCropProps,
} from "react-image-crop";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined,
): PercentCrop {
  return centerCrop(
    aspect
      ? makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight)
      : { x: 0, y: 0, width: 90, height: 90, unit: "%" },
    mediaWidth,
    mediaHeight,
  );
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("Failed to encode canvas to blob.")),
      type,
      quality,
    );
  });
}

async function cropToBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  maxImageSize: number,
  mimeType: "image/png" | "image/jpeg" | "image/webp" = "image/jpeg",
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available.");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.round(pixelCrop.width * scaleX);
  canvas.height = Math.round(pixelCrop.height * scaleY);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, mimeType, quality);
  while (blob.size > maxImageSize && quality > 0.4) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, mimeType, quality);
  }
  return blob;
}

interface ImageCropContextType {
  file: File;
  maxImageSize: number;
  imgSrc: string;
  crop: PercentCrop | undefined;
  completedCrop: PixelCrop | null;
  imgRef: RefObject<HTMLImageElement | null>;
  onCrop?: (blob: Blob, dataUrl: string) => void;
  outputType: "image/png" | "image/jpeg" | "image/webp";
  reactCropProps: Omit<ReactCropProps, "onChange" | "onComplete" | "children">;
  handleChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  handleComplete: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  onImageLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
  applyCrop: () => Promise<void>;
  resetCrop: () => void;
}

const ImageCropContext = createContext<ImageCropContextType | null>(null);

function useImageCrop() {
  const ctx = useContext(ImageCropContext);
  if (!ctx) throw new Error("ImageCrop components must be used inside <ImageCrop>.");
  return ctx;
}

export type ImageCropProps = {
  file: File;
  /** Max accepted output size in bytes — quality drops until under this. Default 2 MB. */
  maxImageSize?: number;
  /** Encoded output type. Defaults to JPEG for smaller profile photos. */
  outputType?: "image/png" | "image/jpeg" | "image/webp";
  /** Fires when the user applies the crop. Receives the cropped Blob + preview URL. */
  onCrop?: (blob: Blob, dataUrl: string) => void;
  children: ReactNode;
  onChange?: ReactCropProps["onChange"];
  onComplete?: ReactCropProps["onComplete"];
} & Omit<ReactCropProps, "onChange" | "onComplete" | "children">;

export function ImageCrop({
  file,
  maxImageSize = 2 * 1024 * 1024,
  outputType = "image/jpeg",
  onCrop,
  children,
  onChange,
  onComplete,
  ...reactCropProps
}: ImageCropProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<PercentCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCrop, setInitialCrop] = useState<PercentCrop>();

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => setImgSrc(String(reader.result ?? "")));
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const next = centerAspectCrop(width, height, reactCropProps.aspect);
      setCrop(next);
      setInitialCrop(next);
    },
    [reactCropProps.aspect],
  );

  const handleChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    onChange?.(pixelCrop, percentCrop);
  };

  const handleComplete = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCompletedCrop(pixelCrop);
    onComplete?.(pixelCrop, percentCrop);
  };

  const applyCrop = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) return;
    const blob = await cropToBlob(imgRef.current, completedCrop, maxImageSize, outputType);
    const dataUrl = URL.createObjectURL(blob);
    onCrop?.(blob, dataUrl);
  };

  const resetCrop = () => {
    if (initialCrop) {
      setCrop(initialCrop);
      setCompletedCrop(null);
    }
  };

  return (
    <ImageCropContext.Provider
      value={{
        file,
        maxImageSize,
        imgSrc,
        crop,
        completedCrop,
        imgRef,
        onCrop,
        outputType,
        reactCropProps,
        handleChange,
        handleComplete,
        onImageLoad,
        applyCrop,
        resetCrop,
      }}
    >
      {children}
    </ImageCropContext.Provider>
  );
}

export interface ImageCropContentProps {
  style?: CSSProperties;
  className?: string;
}

export function ImageCropContent({ style, className }: ImageCropContentProps) {
  const { imgSrc, crop, handleChange, handleComplete, onImageLoad, imgRef, reactCropProps } =
    useImageCrop();

  const shadcnStyle = {
    "--rc-border-color": "var(--color-border)",
    "--rc-focus-color": "var(--color-primary)",
  } as CSSProperties;

  return (
    <ReactCrop
      className={cn(
        "max-h-105 max-w-full overflow-hidden rounded-md border border-border bg-muted/40",
        className,
      )}
      crop={crop}
      onChange={handleChange}
      onComplete={handleComplete}
      style={{ ...shadcnStyle, ...style }}
      {...reactCropProps}
    >
      {imgSrc && (
        <img
          alt="crop preview"
          className="block max-h-105 max-w-full object-contain"
          onLoad={onImageLoad}
          ref={imgRef}
          src={imgSrc}
        />
      )}
    </ReactCrop>
  );
}

export type ImageCropApplyProps = ComponentProps<typeof Button>;

export function ImageCropApply({ onClick, children, ...props }: ImageCropApplyProps) {
  const { applyCrop } = useImageCrop();
  return (
    <Button
      type="button"
      size="sm"
      onClick={async (e) => {
        await applyCrop();
        onClick?.(e);
      }}
      {...props}
    >
      {children ?? (
        <>
          <CropIcon /> Apply crop
        </>
      )}
    </Button>
  );
}

export type ImageCropResetProps = ComponentProps<typeof Button>;

export function ImageCropReset({ onClick, children, ...props }: ImageCropResetProps) {
  const { resetCrop } = useImageCrop();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={(e) => {
        resetCrop();
        onClick?.(e);
      }}
      {...props}
    >
      {children ?? (
        <>
          <RotateCcwIcon /> Reset
        </>
      )}
    </Button>
  );
}
