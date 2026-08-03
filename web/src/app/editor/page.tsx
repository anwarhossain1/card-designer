import type { Metadata } from "next";
import { EditorClient } from "@/components/editor/EditorClient";

export const metadata: Metadata = {
  title: "Editor",
  description: "Design your business card on a 3.5 × 2 inch canvas.",
};

export default function EditorPage() {
  return <EditorClient />;
}
