"use client";

// Shared admin shell: plain sidebar navigation (Slovenian). The login page
// renders without the sidebar.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/api/admin";

const NAV_ITEMS = [
  { href: "/admin", label: "Nadzorna plošča", exact: true },
  { href: "/admin/projects", label: "Projekti" },
  { href: "/admin/content", label: "Vsebina strani" },
  { href: "/admin/media", label: "Medijska knjižnica" },
  { href: "/admin/enquiries", label: "Povpraševanja" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // The admin is a plain neutral tool — keep it in the default palette even when
  // the public site is on a dark theme (data-theme on <html>).
  if (pathname === "/admin/login") {
    return (
      <div data-theme="warm" className="min-h-screen bg-neutral-100">
        {children}
      </div>
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div data-theme="warm" className="flex min-h-screen bg-neutral-100 text-neutral-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-4">
          <p className="text-sm font-semibold">Mizarstvo — admin</p>
        </div>
        <nav aria-label="Glavna navigacija" className="flex-1 px-2 py-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded px-3 py-2 text-sm ${
                      active
                        ? "bg-neutral-900 font-medium text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-neutral-200 p-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full rounded px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
          >
            {loggingOut ? "Odjavljanje …" : "Odjava"}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
