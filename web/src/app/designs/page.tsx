import type { Metadata } from "next";
import { DesignsScreen } from "@/components/designs/DesignsScreen";

export const metadata: Metadata = {
  title: "Your designs",
  description: "Every business card you have made in CardCraft.",
};

export default function DesignsPage() {
  return <DesignsScreen />;
}
