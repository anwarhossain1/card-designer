"use client";

import { useCallback, useState } from "react";
import { useUploadsStore } from "@/store/uploadsStore";
import {
  readImageFile,
  UploadError,
  type UploadedAsset,
} from "@/lib/uploads/readFile";
import { createId } from "@/lib/utils/id";

/**
 * File intake shared by the uploads panel and the canvas drop target, so both
 * enforce the same type and size rules and surface the same error.
 */
export function useUploads() {
  const assets = useUploadsStore((state) => state.assets);
  const add = useUploadsStore((state) => state.add);
  const remove = useUploadsStore((state) => state.remove);
  const [error, setError] = useState<string | null>(null);

  const ingest = useCallback(
    async (files: FileList | File[]): Promise<UploadedAsset[]> => {
      setError(null);
      const accepted: UploadedAsset[] = [];

      for (const file of Array.from(files)) {
        try {
          const asset = await readImageFile(file, createId);
          add(asset);
          accepted.push(asset);
        } catch (cause) {
          setError(
            cause instanceof UploadError
              ? cause.message
              : "That file could not be added",
          );
        }
      }

      return accepted;
    },
    [add],
  );

  return { assets, ingest, remove, error, clearError: () => setError(null) };
}
