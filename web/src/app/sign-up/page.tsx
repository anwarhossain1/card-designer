import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a CardCraft account to save your business card designs.",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
