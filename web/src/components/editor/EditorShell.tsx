"use client";

import { useEffect, useRef } from "react";
import { useIsCompactScreen } from "@/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTemplateDeepLink } from "@/hooks/useTemplateDeepLink";
import { CanvasProvider, useCanvas } from "./canvas/CanvasProvider";
import { CanvasStage } from "./canvas/CanvasStage";
import { PropertiesPanel } from "./properties/PropertiesPanel";
import { PanelDrawer } from "./sidebar/PanelDrawer";
import { SidebarRail } from "./sidebar/SidebarRail";
import { Toolbar } from "./toolbar/Toolbar";
import { MobileTopBar } from "./mobile/MobileTopBar";
import { MobileToolBar } from "./mobile/MobileToolBar";
import { MobileZoomPill } from "./mobile/MobileZoomPill";
import { MobileSheets } from "./mobile/MobileSheets";

export function EditorShell() {
  return (
    <CanvasProvider>
      <EditorLayout />
    </CanvasProvider>
  );
}

/**
 * One canvas, two sets of chrome.
 *
 * Every child is keyed so React matches by key rather than position: the
 * surrounding bars and sidebars swap at the breakpoint while `stage` keeps its
 * identity. That matters more than it looks — remounting the stage would hand
 * Fabric a detached canvas element and the editor would silently render to
 * nothing.
 */
function EditorLayout() {
  const { canvasRef, isHydrated, fitToScreen } = useCanvas();
  const isCompact = useIsCompactScreen();

  useKeyboardShortcuts();
  useTemplateDeepLink(canvasRef, isHydrated);

  /*
   * Crossing the breakpoint changes the workspace by hundreds of pixels — a
   * zoom chosen for the other layout is never the right one to keep. Ordinary
   * resizes still preserve the user's zoom.
   */
  const previousCompact = useRef(isCompact);
  useEffect(() => {
    if (previousCompact.current === isCompact) return;
    previousCompact.current = isCompact;
    fitToScreen();
  }, [isCompact, fitToScreen]);

  return (
    <div
      data-editor-root
      /* dvh, not vh: the mobile URL bar makes 100vh taller than the screen. */
      className="flex h-[100dvh] flex-col overflow-hidden"
    >
      {isCompact ? <MobileTopBar key="chrome-top" /> : <Toolbar key="chrome-top" />}

      <div className="relative flex min-h-0 flex-1">
        {isCompact ? null : <SidebarRail key="rail" />}
        {isCompact ? null : <PanelDrawer key="drawer" />}

        <CanvasStage key="stage" isCompact={isCompact} />

        {isCompact ? null : <PropertiesPanel key="properties" />}
        {isCompact ? <MobileZoomPill key="zoom" /> : null}
      </div>

      {isCompact ? <MobileToolBar key="toolbar" /> : null}
      {isCompact ? <MobileSheets key="sheets" /> : null}
    </div>
  );
}
