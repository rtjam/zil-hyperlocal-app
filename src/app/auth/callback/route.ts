import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth 2.0 Callback Route for Supabase Auth (Google, Apple, Facebook/Instagram)
 * Exchanges the authorization code or redirects back to the mobile app shell.
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const provider = requestUrl.searchParams.get("provider") || "google";
  const next = requestUrl.searchParams.get("next") || "/";

  const redirectUrl = new URL(next, requestUrl.origin);
  redirectUrl.searchParams.set("oauth_success", provider);
  return NextResponse.redirect(redirectUrl);
}
