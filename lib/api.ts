import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios";
// Import getSession (a Promise), NOT useSession (a Hook)
import { getSession } from "next-auth/react";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * - Uses async/await to fetch the session token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // getSession() works in plain JS/TS and returns the session object
    const session = await getSession();
    
    // Cast session as 'any' or your custom Session type to access accessToken
    const token = (session as any)?.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized – token invalid or expired");
      // You can trigger a window.location.href = '/auth/signin' here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
