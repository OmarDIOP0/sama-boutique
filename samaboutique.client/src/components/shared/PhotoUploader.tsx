import { useRef, useState } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingPhoto {
  file: File;
  previewUrl: string;
}

interface Props {
  /** Photos déjà enregistrées (URLs backend) */
  savedPhotos?: string[];
  /** Photos locales avec leurs URLs de preview stables */
  pendingPhotos?: PendingPhoto[];
  /** Appelé quand l'utilisateur sélectionne de nouveaux fichiers */
  onFilesSelected?: (files: File[]) => void;
  /** Appelé quand l'utilisateur supprime une photo locale */
  onPendingRemove?: (index: number) => void;
  /** Appelé quand l'utilisateur supprime une photo sauvegardée */
  onSavedRemove?: (url: string) => void;
  /** URL en cours de suppression */
  deletingUrl?: string | null;
  uploading?: boolean;
  className?: string;
}

export function PhotoUploader({
  savedPhotos = [],
  pendingPhotos = [],
  onFilesSelected,
  onPendingRemove,
  onSavedRemove,
  deletingUrl,
  uploading,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || !onFilesSelected) return;
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    );
    if (valid.length) onFilesSelected(valid);
  };

  const allCount = savedPhotos.length + pendingPhotos.length;

  return (
    <div className={cn("space-y-3", className)}>
      {allCount > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {/* Saved photos */}
          {savedPhotos.map((url) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border/60"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {onSavedRemove && (
                <button
                  type="button"
                  onClick={() => onSavedRemove(url)}
                  disabled={deletingUrl === url}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {deletingUrl === url ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}

          {/* Pending local photos — previewUrl already stable from parent */}
          {pendingPhotos.map((item, i) => (
            <div
              key={item.previewUrl}
              className="relative group aspect-square rounded-xl overflow-hidden bg-muted border-2 border-primary/40"
            >
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5 leading-4">
                En attente
              </div>
              {onPendingRemove && (
                <button
                  type="button"
                  onClick={() => onPendingRemove(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground" />
        )}
        <div className="text-center pointer-events-none">
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Upload en cours…" : "Cliquer ou glisser des images"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            JPEG, PNG, WebP, GIF — max 5 Mo par image
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
