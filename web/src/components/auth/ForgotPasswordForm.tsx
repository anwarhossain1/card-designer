"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthField } from "./AuthField";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const t = useT().auth;
  const { locale } = useI18n();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [isBusy, setIsBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy) return;

    const address = email.trim();
    if (!EMAIL.test(address)) {
      setFieldError(t.validation.emailInvalid);
      return;
    }

    setFieldError(undefined);
    setFormError(undefined);
    setIsBusy(true);

    try {
      await requestPasswordReset({ email: address, locale });
      setSentTo(address);
    } catch (error) {
      if (!(error instanceof ApiError)) setFormError(t.errors.offline);
      else if (error.status === 429) setFormError(t.errors.tooMany);
      else setFormError(t.errors.generic);
    } finally {
      setIsBusy(false);
    }
  };

  /*
   * The confirmation never says whether the address had an account — the API
   * does not tell us, on purpose, and a form that did would be a way to ask
   * who uses CardCraft.
   */
  if (sentTo) {
    return (
      <>
        <span
          aria-hidden
          className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600"
        >
          <MailCheck className="h-5 w-5" />
        </span>
        <h1 className="text-xl font-semibold text-ink-900">
          {t.forgot.sentTitle}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">{t.forgot.sentBody(sentTo)}</p>
        <Link href="/sign-in" className="mt-6 inline-block">
          <Button variant="outline">{t.forgot.backToSignIn}</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink-900">{t.forgot.title}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{t.forgot.subtitle}</p>

      {/*
        noValidate: a type="email" field makes the browser refuse to submit and
        show its own tooltip, in the browser's language rather than the app's.
        The checks below are the ones that speak Bangla.
      */}
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="mt-6 space-y-4"
      >
        <AuthField
          label={t.fields.email}
          type="email"
          inputMode="email"
          placeholder={t.fields.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError}
          autoComplete="email"
          autoFocus
        />

        {formError ? (
          <p
            role="alert"
            className="rounded-md border border-danger-ink/30 bg-danger-ink/5 px-3 py-2 text-sm text-danger-ink"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isBusy ? t.forgot.busy : t.forgot.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link
          href="/sign-in"
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {t.forgot.backToSignIn}
        </Link>
      </p>
    </>
  );
}
