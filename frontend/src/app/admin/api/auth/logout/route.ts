// POST /admin/api/auth/logout — best-effort backend logout, then clears cookies.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  API_BASE,
  clearAuthCookies,
  REFRESH_COOKIE,
} from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Best effort — cookies are cleared regardless.
    }
  }

  clearAuthCookies();
  return NextResponse.json({ ok: true });
}
