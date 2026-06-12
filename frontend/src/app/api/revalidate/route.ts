import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Called by the .NET API on publish (see docs/API-CONTRACT.md):
// POST /api/revalidate, header X-Revalidate-Secret, body { tags: string[] }.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "dev-revalidate-secret";
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body = (await request.json()) as { tags?: unknown };
    if (Array.isArray(body.tags)) {
      tags = body.tags.filter((t): t is string => typeof t === "string");
    }
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, tags });
}
