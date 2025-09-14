import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Upload, Crop as CropIcon, X } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCropped: (croppedImageFile: File) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCrop({ 
  open, 
  onOpenChange, 
  onImageCropped, 
  aspectRatio = 1, 
  circularCrop = true 
}: ImageCropProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  }

  const generateDownload = useCallback(
    async (canvas: HTMLCanvasElement, crop: PixelCrop) => {
      if (!canvas) {
        throw new Error('Crop canvas does not exist');
      }

      if (crop.width && crop.height) {
        // Créer un nouveau canvas pour le crop final
        const cropCanvas = document.createElement('canvas');
        const ctx = cropCanvas.getContext('2d');
        if (!ctx) {
          throw new Error('No 2d context');
        }

        cropCanvas.width = crop.width;
        cropCanvas.height = crop.height;

        ctx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          crop.width,
          crop.height,
        );

        // Convertir en blob
        cropCanvas.toBlob((blob) => {
          if (blob) {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
            }
            blobUrlRef.current = URL.createObjectURL(blob);

            // Créer un fichier à partir du blob
            const file = new File([blob], 'avatar.png', { type: 'image/png' });
            onImageCropped(file);
            onOpenChange(false);
            
            // Reset
            setImgSrc('');
            setCrop(undefined);
            setCompletedCrop(undefined);
          }
        }, 'image/png');
      }
    },
    [onImageCropped, onOpenChange],
  );

  const handleCropComplete = useCallback(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
      );
    }
  }, [completedCrop]);

  // Mettre à jour l'aperçu quand le crop change
  React.useEffect(() => {
    handleCropComplete();
  }, [handleCropComplete]);

  const handleSaveCrop = useCallback(() => {
    if (previewCanvasRef.current && completedCrop) {
      generateDownload(previewCanvasRef.current, completedCrop);
    }
  }, [completedCrop, generateDownload]);

  const handleClose = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Recadrer la photo de profil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imgSrc && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Sélectionner une photo</p>
                <p className="text-sm text-gray-500">
                  Formats acceptés: JPG, PNG, WebP (max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}

          {imgSrc && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop={circularCrop}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ transform: `scale(1) rotate(0deg)` }}
                    onLoad={onImageLoad}
                    className="max-h-96 object-contain"
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              </div>

              {completedCrop && (
                <div className="flex justify-center">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">Aperçu:</p>
                    <canvas
                      ref={previewCanvasRef}
                      className="border rounded-full"
                      style={{
                        objectFit: 'contain',
                        width: 150,
                        height: 150,
                        borderRadius: '25px',
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setImgSrc('')}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Changer d'image
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSaveCrop}
                    disabled={!completedCrop}
                    className="flex items-center gap-2"
                  >
                    <CropIcon className="h-4 w-4" />
                    Valider le recadrage
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Fonction utilitaire pour le canvas preview
function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    crop.width,
    crop.height,
  );
}
