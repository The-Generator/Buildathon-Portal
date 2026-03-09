import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return new TextEncoder().encode(password);
}

export async function middleware(request: NextRequest) {
  // Protect /admin routes (except login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // Verify the JWT is valid and not expired
    const secret = getSecret();
    if (secret) {
      try {
        await jwtVerify(token, secret);
      } catch {
        // Token is invalid or expired — clear cookie and redirect to login
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        const response = NextResponse.redirect(url);
        response.cookies.set("admin_token", "", {
          path: "/admin",
          maxAge: 0,
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
