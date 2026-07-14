import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";


// All routes that require an authenticated session
const protectedRoutes = [
    "/dashboard",
    "/settings",
    "/programs",
    "/indicators",
    "/calendar",
    "/planning-years",
    "/main-goals",
    "/program-wallets",
    "/reports",
    "/implementation",
    "/timeline",
    "/admin",
];

// Routes that authenticated users should not see (e.g. login page)
const authRoutes = ["/", "/login"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isAuthRoute = authRoutes.includes(path);

    const response = NextResponse.next();

    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    if (isAuthRoute && session?.userId && path === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return response;
}

// Apply middleware to all routes except static assets
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
