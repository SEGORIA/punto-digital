import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (role === "WAREHOUSE" && !path.startsWith("/admin/bodega")) {
      return NextResponse.redirect(new URL("/admin/bodega", req.url));
    }
  },
  {
    pages: { signIn: "/admin/login" },
  }
);

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
