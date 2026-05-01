import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protege cualquier ruta que empiece con /admin
  matcher: ["/admin/:path*"],
};
