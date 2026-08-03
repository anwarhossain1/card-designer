"use client";

import { useState } from "react";
import type { FabricObject } from "fabric";
import { FieldGroup } from "@/components/ui/Field";
import { QrForm } from "@/components/editor/qr/QrForm";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { getQrConfig } from "@/lib/canvas/elements/qr";
import { DEFAULT_QR_CONFIG, encodeQrPayload } from "@/lib/qr/config";
import { pxToInches, round } from "@/lib/utils/units";

/** Minimum width most phone scanners handle reliably on print. */
const MIN_SCAN_INCHES = 0.4;

/**
 * Edits are held locally and pushed to the canvas whenever they encode to
 * something. Without the draft, switching to an empty vCard would produce no
 * payload, nothing would be applied, and the form would snap back to the old
 * type mid-edit.
 *
 * Mounted with `key={element id}`, so selecting another code starts fresh.
 */
export function QrProperties({ target }: { target: FabricObject }) {
  const { updateQr } = useCanvasActions();
  const [draft, setDraft] = useState(() => getQrConfig(target) ?? DEFAULT_QR_CONFIG);

  const widthInches = pxToInches(target.getScaledWidth());
  const isReadable = widthInches >= MIN_SCAN_INCHES;
  const isEmpty = !encodeQrPayload(draft);

  return (
    <FieldGroup title="QR code">
      <QrForm
        value={draft}
        onChange={(next) => {
          setDraft(next);
          if (encodeQrPayload(next)) void updateQr(target, next);
        }}
      />

      {isEmpty ? (
        <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          Fill in the details to update the code — the card still shows the last
          one that encoded.
        </p>
      ) : (
        <p
          className={
            isReadable
              ? "text-[11px] text-ink-400"
              : "rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800"
          }
        >
          {isReadable
            ? `${round(widthInches, 2)} in wide — fine for scanning.`
            : `${round(widthInches, 2)} in wide. Scale it up to at least ${MIN_SCAN_INCHES} in so phones can read it in print.`}
        </p>
      )}
    </FieldGroup>
  );
}
