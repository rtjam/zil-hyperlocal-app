import { AuthProvider } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_URL.includes("your-project-ref")
  );
}

/**
 * Returns the live Supabase OAuth 2.0 authorization URL for Google, Apple, or Facebook/Instagram
 * when NEXT_PUBLIC_SUPABASE_URL is set.
 */
export function getSupabaseOAuthUrl(provider: AuthProvider): string | null {
  if (!isSupabaseConfigured()) return null;
  const supaProvider = provider === "instagram" ? "facebook" : provider;
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?provider=${provider}`
      : "";
  return `${SUPABASE_URL}/auth/v1/authorize?provider=${supaProvider}&redirect_to=${encodeURIComponent(
    redirectTo
  )}`;
}

export async function callSupabaseRpc<T>(
  fnName: string,
  params: Record<string, unknown>
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
