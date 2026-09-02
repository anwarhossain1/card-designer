import type { Metadata } from "next";
import { GenerateWizard } from "@/components/generate/GenerateWizard";

export const metadata: Metadata = {
  title: "Generate cards",
  description: "Turn a spreadsheet into a batch of personalized cards.",
};

export default function GeneratePage() {
  return <GenerateWizard />;
}
