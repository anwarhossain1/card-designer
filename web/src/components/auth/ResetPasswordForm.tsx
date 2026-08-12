"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthField } from "./AuthField";

export function ResetPasswordForm() {
  const t = useT().auth;
  const { locale } = useI18n();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [isBusy, setIsBusy] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy) return;

    if (password.length < 8) {
      setFieldError(t.validation.passwordShort);
      return;
    }

    setFieldError(undefined);
    setFormError(undefined);
    setIsBusy(true);

    try {
      await resetPassword({ token, password, locale });
      setIsDone(true);
    } catch (error) {
      if (!(error instanceof ApiError)) setFormError(t.errors.offline);
      // Spent, forged and expired all arrive as 400; the API does not
      // distinguish them and neither should this.
      else if (error.status === 400) setFormError(t.reset.invalidLink);
      else if (error.status === 429) setFormError(t.errors.tooMany);
      else setFormError(t.errors.generic);
    } finally {
      setIsBusy(false);
    }
  };

  if (isDone) {
    return (
      <>
        <span
          aria-hidden
          className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600"
        >
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h1 className="text-xl font-semibold text-ink-900">
          {t.reset.doneTitle}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">{t.reset.doneBody}</p>
        <Link href="/sign-in" className="mt-6 inline-block">
          <Button>{t.signIn.submit}</Button>
        </Link>
      </>
    );
  }

  // A link that arrived without its token can only be answered with a new one.
  if (!token) {
    return (
      <>
        <h1 className="text-xl font-semibold text-ink-900">{t.reset.title}</h1>
        <p role="alert" className="mt-3 text-sm text-danger-ink">
          {t.reset.missingToken}
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block">
          <Button variant="outline">{t.reset.requestNew}</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink-900">{t.reset.title}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{t.reset.subtitle}</p>

      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="mt-6 space-y-4"
      >
        <AuthField
          label={t.reset.newPassword}
          type={revealed ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldError}
          hint={t.fields.passwordHint}
          autoComplete="new-password"
          autoFocus
          trailing={
            <button
              type="button"
              onClick={() => setRevealed((shown) => !shown)}
              aria-label={
                revealed ? t.fields.hidePassword : t.fields.showPassword
              }
              className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition-colors hover:text-ink-800"
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {formError ? (
          <div
            role="alert"
            className="space-y-2 rounded-md border border-danger-ink/30 bg-danger-ink/5 px-3 py-2.5"
          >
            <p className="text-sm text-danger-ink">{formError}</p>
            {formError === t.reset.invalidLink ? (
              <Link
                href="/forgot-password"
                className="inline-block text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                {t.reset.requestNew}
              </Link>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isBusy ? t.reset.busy : t.reset.submit}
        </Button>
      </form>
    </>
  );
}
