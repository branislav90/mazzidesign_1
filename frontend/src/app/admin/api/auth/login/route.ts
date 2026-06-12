// POST /admin/api/auth/login — exchanges credentials with the backend and
// stores the token pair in httpOnly cookies. The browser never sees the JWT.

import { NextResponse } from "next/server";
import {
  API_BASE,
  setAuthCookies,
  type TokenPair,
} from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Neveljavna zahteva." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Vnesite e-pošto in geslo." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Strežnik API ni dosegljiv." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const status = res.status === 400 || res.status === 401 ? 401 : 502;
    return NextResponse.json(
      { message: "Napačna e-pošta ali geslo." },
      { status },
    );
  }

  const tokens = (await res.json()) as TokenPair;
  setAuthCookies(tokens);
  return NextResponse.json({ ok: true });
}
