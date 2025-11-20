import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // ✅ add your FastAPI JWT
    error?:string
    user?: {
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
  }

  interface JWT {
    accessToken?: string;
  }
}