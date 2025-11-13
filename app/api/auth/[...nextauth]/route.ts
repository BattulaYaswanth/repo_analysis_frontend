import NextAuth, { type NextAuthOptions, type User, type Session } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import axios from "axios"

// Type definitions for your backend response
interface BackendAuthResponse {
  access_token: string
  token_type: string
}

interface BackendErrorResponse {
  detail: string
}

interface CustomUser extends User {
  accessToken?: string
}

interface CustomSession extends Session {
  accessToken?: string
  error?: string
}

interface CustomToken extends JWT {
  accessToken?: string
  error?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          const response = await axios.post<BackendAuthResponse>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          if (response.status === 200 && response.data.access_token) {
            return {
              id: credentials.email, // Using email as ID since your backend doesn't return user ID in response
              email: credentials.email,
              accessToken: response.data.access_token,
            }
          }

          throw new Error("Unexpected response from backend")
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const errorData = error.response.data as BackendErrorResponse
            throw new Error(errorData.detail || "Invalid credentials")
          } else if (error instanceof Error) {
            throw new Error(error.message)
          } else {
            throw new Error("Network or server error")
          }
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - matches typical JWT expiry
  },
  callbacks: {
    async jwt({ token, user, account }: { token: CustomToken; user?: CustomUser; account?: any }): Promise<CustomToken> {
      // Initial sign in
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
        }
      }
      return token
    },
    async session({ session, token }: { session: CustomSession; token: CustomToken }): Promise<CustomSession> {
      // Send access token to client in session
      session.accessToken = token.accessToken
      session.error = token.error
      // Ensure session.expires is always a string
      session.expires = typeof token.exp === "number" ? new Date(token.exp * 1000).toISOString() : "";
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }