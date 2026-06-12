// Shared helpers for the admin auth + proxy route handlers.
// Tokens live ONLY in httpOnly cookies — never readable by client JS.

import { cookies } from "next/headers";

export const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5080";

export const ACCESS_COOKIE = "ww_access";
export const REFRESH_COOKIE = "ww_refresh";

const ACCESS_MAX_AGE = 15 * 60; // ~15 min, mirrors backend JWT lifetime
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc?: string;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(tokens: TokenPair) {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_MAX_AGE));
  jar.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export function clearAuthCookies() {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, "", { ...cookieOptions(0) });
  jar.set(REFRESH_COOKIE, "", { ...cookieOptions(0) });
}

/** Calls the backend refresh endpoint. Returns the new pair or null on failure. */
export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenPair;
  } catch {
    return null;
  }
}
