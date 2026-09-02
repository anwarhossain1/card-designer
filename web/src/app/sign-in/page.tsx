import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CardCraft to keep your business card designs.",
};

export default function SignInPage() {
  return (
    <AuthShell>
      {/* useSearchParams reads `next`, which needs a boundary on a static page. */}
      <Suspense fallback={null}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
