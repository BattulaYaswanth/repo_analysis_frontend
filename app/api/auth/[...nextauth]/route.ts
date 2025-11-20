import NextAuth, { type NextAuthOptions, type User, type Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import axios from "axios"

// --- 1. UPDATED TYPE DEFINITIONS ---

// Define the response structure expected from your backend's login/refresh endpoints
interface BackendAuthResponse {
  access_token: string
  refresh_token: string // Expected refresh token
  expires_in: number    // Access token lifetime in seconds (e.g., 3600)
  token_type: string
}

interface BackendErrorResponse {
  detail: string
}

// Custom User type for data stored during the authorize call
interface CustomUser extends User {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number // Unix timestamp (milliseconds) for access token expiry
}

// Custom JWT type for data stored inside the encrypted token
interface CustomToken extends JWT {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number // Unix timestamp (milliseconds) for access token expiry
  error?: "RefreshAccessTokenError" // Error flag for client-side signout
}

// Custom Session type for data exposed to the client
interface CustomSession extends Session {
  accessToken?: string
  error?: "RefreshAccessTokenError"
}


// --- 2. TOKEN REFRESH UTILITY FUNCTION ---

/**
 * Calls the backend refresh endpoint to exchange the old refresh token for a new access token.
 * @param token The current expired JWT token containing the refreshToken.
 * @returns A new JWT token with updated tokens and expiry, or an error status.
 * 
 * 
 */

async function refreshAccessToken(token: CustomToken): Promise<CustomToken> {
  console.log("🔁 Refreshing with token:");
  try {
    const response = await axios.post<BackendAuthResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, // **Ensure this is your correct refresh endpoint**
      {
        refresh_token: token.refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const { access_token, refresh_token, expires_in } = response.data

    // Calculate new expiry time: Current time (ms) + expires_in (s) * 1000
    const newExpiresAt = Date.now() + expires_in * 1000

    return {
      ...token,
      accessToken: access_token,
      // If the backend returns a new refresh token (refresh token rotation), use it. Otherwise, keep the old one.
      refreshToken: refresh_token ?? token.refreshToken, 
      expiresAt: newExpiresAt,
      error: undefined, // Clear any previous errors
    }
  } catch (error) {
    console.error("Token refresh error:", error)
    // On failure (e.g., refresh token expired), mark the token with an error
    return {
      ...token,
      error: "RefreshAccessTokenError" as const, 
    }
  }
}

// --- 3. NEXTAUTH CONFIGURATION ---

export const authOptions: NextAuthOptions = {
  providers: [
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
            const { access_token, refresh_token, expires_in } = response.data
            
            // Calculate expiry timestamp (in milliseconds)
            const expiresAt = Date.now() + expires_in * 1000 

            return {
              id: credentials.email, 
              email: credentials.email,
              accessToken: access_token,
              refreshToken: refresh_token, // <-- Store Refresh Token
              expiresAt: expiresAt,       // <-- Store Expiry
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
    maxAge: 24 * 60 * 60, // The session maxAge should be based on how long you want the *refresh token* to be valid.
  },
  callbacks: {
    // This callback runs first and is critical for managing tokens in the JWT.
    async jwt({ token, user, account }: { token: CustomToken; user?: CustomUser; account?: any }): Promise<CustomToken> {
      // 1. Initial sign in (User object is present)
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        }
      }

      // 2. Subsequent requests: Check if the access token is still valid.
      // We use a 1-minute buffer (60 * 1000ms) before the true expiry time.
      const isTokenValid = token.expiresAt && Date.now() < token.expiresAt - 60 * 1000
      
      if (isTokenValid) {
        return token
      }

      // 3. Access token has expired, attempt to refresh it.
      if (token.refreshToken) {
        console.log("Access token expired. Attempting refresh...")
        return refreshAccessToken(token)
      }
      
      // If no refresh token exists, the session must end.
      return {
        ...token,
        error: "RefreshAccessTokenError" as const
      }
    },
    
    // FIX: Remove explicit parameter typing to satisfy NextAuth's complex internal session types.
    // We use type casting inside the function body instead.
    async session({ session, token }) {
      const customToken = token as CustomToken;
      const customSession = session as CustomSession; // Cast Session to CustomSession

      // Pass the access token to the client.
      customSession.accessToken = customToken.accessToken
      
      // Pass the error status to the client (e.g., to force signout if refresh failed).
      customSession.error = customToken.error
      
      // Update session expiry based on the access token's expiry time for accurate UI display.
      if (customToken.expiresAt) {
          customSession.expires = new Date(customToken.expiresAt).toISOString();
      }
      
      return customSession
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }