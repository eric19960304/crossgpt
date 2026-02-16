import { auth } from "@/auth";

export default auth((req) => {
  // The auth callback in authConfig will handle authorization
  // This middleware runs on all routes
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public|icons).*)"],
};
