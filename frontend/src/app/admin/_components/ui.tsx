"use client";

// Plain, neutral UI primitives shared across admin pages.

import { ReactNode } from "react";

export const inputClass =
  "w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 disabled:bg-neutral-100";

export const buttonPrimary =
  "inline-flex items-center justify-center rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center justify-center rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center justify-center rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50";

export function PageTitle({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      {actions}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-neutral-200 bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export function Loading({ label = "Nalaganje …" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 py-10 text-sm text-neutral-500"
    >
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700"
      />
      {label}
    </div>
  );
}

export function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium underline"
        >
          Poskusi znova
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-10 text-center text-sm text-neutral-500">{message}</p>
  );
}

export function Labelled({
  label,
  htmlFor,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: "Draft" | "Published" }) {
  return status === "Published" ? (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      Objavljeno
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
      Osnutek
    </span>
  );
}
