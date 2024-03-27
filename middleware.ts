import { authMiddleware } from "@clerk/nextjs";

// Este middleware sirve para setear rutas privadas o publicas para el auth de clerk.

export default authMiddleware({
    publicRoutes: ["/api/uploadthing"]
});

export const config = {
    // Protects all routes, including api/trpc.
    // See https://clerk.com/docs/references/nextjs/auth-middleware
    // for more information about configuring your Middleware
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};