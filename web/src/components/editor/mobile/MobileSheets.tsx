"use client";

import { useEffect } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PropertiesPanel } from "@/components/editor/properties/PropertiesPanel";
import { PANEL_CONTENT } from "@/components/editor/sidebar/panelContent";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useUiStore } from "@/store/uiStore";
import { useT } from "@/components/i18n/I18nProvider";
import { MoreSheetContent } from "./MoreSheetContent";

/** The three bottom sheets: a tool panel, element properties, and settings. */
export function MobileSheets() {
  const t = useT().editor;
  const { selected } = useCanvas();

  const activePanel = useUiStore((state) => state.activePanel);
  const mobileSheet = useUiStore((state) => state.mobileSheet);
  const closeSheet = useUiStore((state) => state.closeSheet);

  /* A sheet describing a selection is noise once that selection is gone. */
  useEffect(() => {
    if (mobileSheet === "properties" && selected.length === 0) closeSheet();
  }, [mobileSheet, selected.length, closeSheet]);

  const PanelBody = activePanel ? PANEL_CONTENT[activePanel] : null;

  return (
    <>
      <BottomSheet
        open={mobileSheet === "panel" && Boolean(PanelBody)}
        onClose={closeSheet}
        title={activePanel ? t.panels[activePanel] : ""}
      >
        {PanelBody ? <PanelBody /> : null}
      </BottomSheet>

      <BottomSheet
        open={mobileSheet === "properties"}
        onClose={closeSheet}
        title={t.properties.title}
      >
        {/* The desktop sidebar body, minus its chrome. */}
        <PropertiesPanel embedded />
      </BottomSheet>

      <BottomSheet
        open={mobileSheet === "more"}
        onClose={closeSheet}
        title={t.mobileUi.more}
        maxHeight="80dvh"
      >
        <MoreSheetContent />
      </BottomSheet>
    </>
  );
}
