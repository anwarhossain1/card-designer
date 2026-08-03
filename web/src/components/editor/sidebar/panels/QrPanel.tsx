"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QrForm } from "@/components/editor/qr/QrForm";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useT } from "@/components/i18n/I18nProvider";
import {
  DEFAULT_QR_CONFIG,
  encodeQrPayload,
  type QrConfig,
} from "@/lib/qr/config";

export function QrPanel() {
  const t = useT().editor.qr;
  const { addQr } = useCanvasActions();
  const [config, setConfig] = useState<QrConfig>(DEFAULT_QR_CONFIG);

  const isReady = encodeQrPayload(config).length > 0;

  return (
    <div className="space-y-4">
      <QrForm value={config} onChange={setConfig} />

      <Button
        size="sm"
        className="w-full"
        disabled={!isReady}
        onClick={() => void addQr(config)}
      >
        <QrCode className="h-4 w-4" />
        {t.add}
      </Button>

      <p className="px-1 text-[11px] leading-relaxed text-ink-400">
        {isReady ? t.ready : t.empty}
      </p>
    </div>
  );
}
