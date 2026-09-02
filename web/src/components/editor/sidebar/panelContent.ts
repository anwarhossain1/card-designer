import type { PanelId } from "@/store/uiStore";
import { TextPanel } from "./panels/TextPanel";
import { ShapesPanel } from "./panels/ShapesPanel";
import { IconsPanel } from "./panels/IconsPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { UploadsPanel } from "./panels/UploadsPanel";
import { BackgroundPanel } from "./panels/BackgroundPanel";
import { QrPanel } from "./panels/QrPanel";
import { DataPanel } from "./panels/DataPanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";

/**
 * Panel body per tool, shared by the desktop drawer and the mobile bottom
 * sheet. The panels know nothing about their container, so a tool added here
 * appears on both layouts at once.
 */
export const PANEL_CONTENT: Record<PanelId, () => React.JSX.Element> = {
  templates: TemplatesPanel,
  uploads: UploadsPanel,
  text: TextPanel,
  shapes: ShapesPanel,
  icons: IconsPanel,
  background: BackgroundPanel,
  qr: QrPanel,
  data: DataPanel,
  layers: LayersPanel,
};
