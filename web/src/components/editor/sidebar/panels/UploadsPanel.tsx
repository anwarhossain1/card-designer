"use client";

import { useRef, useState, type DragEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useUploads } from "@/hooks/useUploads";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { ACCEPTED_UPLOAD_TYPES } from "@/lib/uploads/readFile";

export function UploadsPanel() {
  const { assets, ingest, remove, error } = useUploads();
  const { addImage } = useCanvasActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    setIsOver(false);
    if (event.dataTransfer.files.length) await ingest(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => void handleDrop(event)}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
          isOver
            ? "border-brand-400 bg-brand-50"
            : "border-ink-200 bg-panel-muted",
        )}
      >
        <Upload className="h-5 w-5 text-ink-400" />
        <p className="text-xs text-ink-500">
          Drop a logo or photo here, or
        </p>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          Choose a file
        </Button>
        <p className="text-[11px] text-ink-400">PNG, JPEG or SVG · up to 8 MB</p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES.join(",")}
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) void ingest(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md bg-danger-surface px-3 py-2 text-xs text-danger-ink"
        >
          {error}
        </p>
      ) : null}

      {assets.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <li key={asset.id} className="group relative">
              <button
                type="button"
                onClick={() => void addImage(asset)}
                title={`Add ${asset.name}`}
                className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-hairline bg-panel-muted p-2 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                {/* Data URLs bypass the image optimiser, so a plain img is right here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.dataUrl}
                  alt={asset.name}
                  className="max-h-full w-auto object-contain"
                />
              </button>
              <IconButton
                size="sm"
                label={`Remove ${asset.name} from uploads`}
                onClick={() => remove(asset.id)}
                className="absolute right-1 top-1 bg-panel/90 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-1 text-[11px] leading-relaxed text-ink-400">
          Uploads stay in this browser session. The design keeps its own copy of
          every image, so a saved card always reopens complete.
        </p>
      )}
    </div>
  );
}
