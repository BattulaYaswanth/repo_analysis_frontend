// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(async function middleware(req) {
  const token = req.nextauth?.token?.accessToken;

  if (token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token invalid or expired → force sign out
      return Response.redirect(new URL("/auth/signin", req.url));
    }
  }
});

export const config = {
  matcher: [
    // protect everything except /auth/sign (signin) and /
    "/((?!auth/sign|$|_next/static|_next/image|favicon.ico).*)",
  ],
};
