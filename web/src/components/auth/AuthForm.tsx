"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/I18nProvider";
import { useLogin, useRegister, useSession } from "@/hooks/useSession";
import { ApiError } from "@/lib/api/client";
import { AuthField } from "./AuthField";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password" | "form";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_DESTINATION = "/editor";

/**
 * Only our own in-app paths are followed after signing in. `//evil.example` is
 * a protocol-relative URL that leaves the site while still starting with a
 * slash, so a leading-slash check alone is not enough.
 */
function safeDestination(next: string | null): string {
  if (!next?.startsWith("/") || next.startsWith("//")) return DEFAULT_DESTINATION;
  return next;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useT().auth;
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeDestination(params.get("next"));

  const isSignUp = mode === "sign-up";
  const copy = isSignUp ? t.signUp : t.signIn;

  const { user } = useSession();
  const login = useLogin();
  const register = useRegister();
  const isBusy = login.isPending || register.isPending;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Arriving here with a live session means the page is pointless; leave.
  useEffect(() => {
    if (user) router.replace(destination);
  }, [user, destination, router]);

  /** Mirrors the server's zod schema so the usual mistakes never round-trip. */
  const validate = (): Errors => {
    const found: Errors = {};
    if (isSignUp && name.trim().length < 2) found.name = t.validation.nameShort;
    if (!EMAIL.test(email.trim())) found.email = t.validation.emailInvalid;

    if (password.length === 0) {
      found.password = t.validation.passwordEmpty;
    } else if (isSignUp && password.length < 8) {
      // Only on sign-up: an existing password shorter than today's rule must
      // still be able to sign in.
      found.password = t.validation.passwordShort;
    }

    return found;
  };

  const messageFor = (error: unknown): string => {
    if (!(error instanceof ApiError)) return t.errors.offline;

    switch (error.status) {
      case 401:
        return t.errors.invalidCredentials;
      case 409:
        return t.errors.emailTaken;
      case 403:
        return t.errors.suspended;
      default:
        return t.errors.generic;
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      if (isSignUp) {
        await register.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await login.mutateAsync({ email: email.trim(), password });
      }
      router.replace(destination);
    } catch (error) {
      setErrors({ form: messageFor(error) });
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-ink-900">{copy.title}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{copy.subtitle}</p>

      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        {isSignUp ? (
          <AuthField
            label={t.fields.name}
            placeholder={t.fields.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            autoComplete="name"
            autoFocus
          />
        ) : null}

        <AuthField
          label={t.fields.email}
          type="email"
          inputMode="email"
          placeholder={t.fields.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          autoComplete="email"
          autoFocus={!isSignUp}
        />

        <AuthField
          label={t.fields.password}
          type={revealed ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          hint={isSignUp ? t.fields.passwordHint : undefined}
          autoComplete={isSignUp ? "new-password" : "current-password"}
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

        {errors.form ? (
          <p
            role="alert"
            className="rounded-md border border-danger-ink/30 bg-danger-ink/5 px-3 py-2 text-sm text-danger-ink"
          >
            {errors.form}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isBusy ? copy.busy : copy.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {copy.switchPrompt}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {copy.switchAction}
        </Link>
      </p>

      <p className="mt-4 border-t border-hairline pt-4 text-xs text-ink-400">
        {t.localNote}
      </p>
    </>
  );
}
