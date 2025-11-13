import axios from "axios";

export const validToken = async (token: string) => {
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    console.error("Backend URL not defined");
    return false;
  }

  try {
    const response = await axios.get(`${url}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
  } catch (err) {
    console.error("Token validation failed:", err);
    return false;
  }
};
