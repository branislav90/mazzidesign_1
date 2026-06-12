"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "@/lib/api/admin";
import {
  buttonPrimary,
  Card,
  inputClass,
  Labelled,
} from "../_components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Prijava ni uspela. Poskusite znova.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-1 text-lg font-semibold text-neutral-900">
          Prijava v administracijo
        </h1>
        <p className="mb-5 text-sm text-neutral-500">
          Mizarstvo — nadzorna plošča
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Labelled label="E-pošta" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Labelled>
          <Labelled label="Geslo" htmlFor="login-password">
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Labelled>
          {error && (
            <p
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !email || !password}
            className={`${buttonPrimary} w-full`}
          >
            {submitting ? "Prijavljanje …" : "Prijava"}
          </button>
        </form>
      </Card>
    </main>
  );
}
