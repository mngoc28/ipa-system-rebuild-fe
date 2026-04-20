import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Check, X, Loader2 } from "lucide-react";

/**
 * Represents the coordinates and dimensions of a selected crop area.
 */
interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Props for the AvatarCropper component.
 */
interface AvatarCropperProps {
    image: string;
    onCropComplete: (file: File) => void;
    onCancel: () => void;
    aspect?: number;
    isUploading?: boolean;
}

/**
 * An interactive image cropping utility specifically designed for user avatars.
 * Provides zooming functionality and a circular crop preview.
 * 
 * @param props - Component props following AvatarCropperProps interface.
 */
export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  aspect = 1,
  isUploading = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<File | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  const handleDone = async () => {
    if (croppedAreaPixels) {
      const croppedFile = await getCroppedImg(image, croppedAreaPixels);
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
          cropShape="round"
          showGrid={false}
          style={{
            containerStyle: { background: "#0f172a" },
            cropAreaStyle: { border: "2px solid white" }
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <ZoomOut className="text-slate-400" size={18} />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
          />
          <ZoomIn className="text-slate-400" size={18} />
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 gap-2" disabled={isUploading}>
            <X size={16} /> Cancel
          </Button>
          <Button onClick={handleDone} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check size={16} /> Done
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
