import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/unete",
  },
});

export const config = {
  matcher: ["/usuario/:path*", "/dashboard/:path*"],
};
