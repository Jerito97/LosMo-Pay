import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { getSessionOptions, sessionCookieName, type SessionData } from "@/lib/auth/session";

const PUBLIC_AUTH_ROUTES = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
  "/migrar-cuenta",
]);

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(sessionCookieName)?.value;
  let userId: string | undefined;

  if (cookie) {
    try {
      const data = await unsealData<SessionData>(cookie, {
        password: getSessionOptions().password,
      });
      userId = data.userId;
    } catch {
      userId = undefined;
    }
  }

  const { pathname } = request.nextUrl;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.has(pathname);

  if (!userId && !isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (userId && isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo-losmo-pay.png).*)"],
};
