// Thin fetch helper for the .NET API. Generated types land in ./types.ts
// via `npm run gen:api` (openapi-typescript against the backend swagger spec).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
