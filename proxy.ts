import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Minimal NextAuth config for Edge middleware — no Prisma/DB calls.
// JWT-only verification: just checks the session token exists and is valid.
const { auth } = NextAuth({
  providers: [Credentials({})],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
});

export default auth;

export const config = {
  matcher: ["/recruiter/:path*"],
};
