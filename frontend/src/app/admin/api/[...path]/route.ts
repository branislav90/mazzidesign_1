// Catch-all proxy: /admin/api/* → {API}/api/admin/* with Bearer auth from the
// httpOnly ww_access cookie. On a backend 401 it performs ONE refresh attempt
// (rotating both cookies) and retries; if the refresh fails, cookies are
// cleared and 401 is returned so the client redirects to /admin/login.
//
// The request body is buffered (arrayBuffer) instead of streamed so the exact
// same bytes — JSON or multipart, content-type with boundary preserved — can be
// re-sent on the post-refresh retry; a consumed stream cannot be replayed.

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  API_BASE,
  clearAuthCookies,
  REFRESH_COOKIE,
  refreshTokens,
  setAuthCookies,
} from "../_lib/auth";

export const dynamic = "force-dynamic";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

async function proxy(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const jar = cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  const target = `${API_BASE}/api/admin/${params.path.join("/")}${request.nextUrl.search}`;
  const method = request.method;
  const body = BODYLESS_METHODS.has(method)
    ? undefined
    : await request.arrayBuffer();
  const contentType = request.headers.get("content-type");

  const forward = async (token: string) => {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (contentType) headers["Content-Type"] = contentType;
    const accept = request.headers.get("accept");
    if (accept) headers["Accept"] = accept;
    return fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      // @ts-expect-error — required by undici when a body is present on some runtimes
      duplex: "half",
    });
  };

  const unauthorized = () => {
    clearAuthCookies();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  };

  let upstream: Response | null = null;
  try {
    if (accessToken) {
      upstream = await forward(accessToken);
    }

    if (!upstream || upstream.status === 401) {
      if (!refreshToken) return unauthorized();
      const rotated = await refreshTokens(refreshToken);
      if (!rotated) return unauthorized();
      setAuthCookies(rotated);
      upstream = await forward(rotated.accessToken);
      if (upstream.status === 401) return unauthorized();
    }
  } catch {
    return NextResponse.json(
      { message: "Strežnik API ni dosegljiv." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) responseHeaders.set("Content-Type", upstreamType);

  return new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
