"use client";

import { useIsSmallScreen } from "@/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CanvasProvider } from "./canvas/CanvasProvider";
import { CanvasStage } from "./canvas/CanvasStage";
import { MobileNotice } from "./MobileNotice";
import { PropertiesPanel } from "./properties/PropertiesPanel";
import { PanelDrawer } from "./sidebar/PanelDrawer";
import { SidebarRail } from "./sidebar/SidebarRail";
import { Toolbar } from "./toolbar/Toolbar";

/**
 * Editor layout:
 *   toolbar
 *   rail | panel drawer | canvas (+ zoom bar) | properties
 */
export function EditorShell() {
  const isSmallScreen = useIsSmallScreen();

  if (isSmallScreen) return <MobileNotice />;

  return (
    <CanvasProvider>
      <EditorLayout />
    </CanvasProvider>
  );
}

/** Inside the provider so the chrome and shortcuts can reach the canvas. */
function EditorLayout() {
  useKeyboardShortcuts();

  return (
    <div data-editor-root className="flex h-screen flex-col overflow-hidden">
      <Toolbar />

      <div className="flex min-h-0 flex-1">
        <SidebarRail />
        <PanelDrawer />
        <CanvasStage />
        <PropertiesPanel />
      </div>
    </div>
  );
}
