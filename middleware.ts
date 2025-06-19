import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard") || 
                          req.nextUrl.pathname.startsWith("/subscriptions") ||
                          req.nextUrl.pathname.startsWith("/analytics") ||
                          req.nextUrl.pathname.startsWith("/settings")

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return null
  }

  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = req.nextUrl.pathname
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.url))
  }

  return null
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}