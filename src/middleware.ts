import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // If Supabase fetch fails (e.g. invalid URL due to missing env variables)
    console.error("Supabase auth error:", error);
  }

  // Protect all routes except /login and static assets
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isStaticFile = request.nextUrl.pathname.startsWith("/_next") || 
                       request.nextUrl.pathname.includes(".");

  if (!isStaticFile) {
    if (!user && !isLoginPage) {
      // no user, potentially respond by redirecting the user to the login page
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user && isLoginPage) {
       // if user is logged in, they shouldn't be on the login page
       return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
