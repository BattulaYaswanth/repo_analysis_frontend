// app/auth/verify/page.tsx  (or components/OTPPage.tsx)
// "use client" required
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner"; // optional - replace with alert if not installed

type VerifyResponse = {
  status: string;
  message?: string;
};

export default function OTPPage() {
  const search = useSearchParams();
  const router = useRouter();

  // Try to read email from query param, then fallback to localStorage
  const emailFromQuery = search?.get("email") ?? undefined;
  const [email, setEmail] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return emailFromQuery ?? undefined;
    const fromStorage = localStorage.getItem("pending_verification_email");
    return emailFromQuery ?? fromStorage ?? undefined;
  });

  // OTP digits stored as string of length 6 or as array
  const [otp, setOtp] = useState<string>(""); // accepts "123456"
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0); // seconds
  const cooldownRef = useRef<number | null>(null);
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;

  // On mount, if we have an email query param store it in localStorage for navigation continuity
  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      localStorage.setItem("pending_verification_email", emailFromQuery);
    }
  }, [emailFromQuery]);

  // cooldown timer tick
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }
    if (!cooldownRef.current) {
      cooldownRef.current = window.setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            if (cooldownRef.current) {
              window.clearInterval(cooldownRef.current);
              cooldownRef.current = null;
            }
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldown]);

  // small validation helper
  const validateOtpFormat = (value: string) => {
    return /^\d{6}$/.test(value);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      toast?.error?.("Email not found. Please go back and re-register.");
      return;
    }
    if (!validateOtpFormat(otp)) {
      toast?.error?.("Enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post<VerifyResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/verify-otp`, {
        email,
        otp,
      });
      // expected backend: { status: 'success', message: '...' }
      if (res.data?.status === "success") {
        toast?.success?.(res.data.message || "Account verified!");
        // Clean up storage and redirect to signin
        localStorage.removeItem("pending_verification_email");
        setTimeout(() => router.push("/auth/signin"), 800);
      } else {
        // backend could send {status: 'error', message: '...'}
        toast?.error?.(res.data?.message || "Verification failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed";
      toast?.error?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast?.error?.("No email to resend OTP to.");
      return;
    }
    setResendLoading(true);
    try {
      await axios.post(`${api}/api/user/resend-otp`, { email });
      toast?.success?.("OTP resent. Check your email.");
      // cooldown for resend (e.g., 60 seconds)
      setCooldown(60);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP";
      toast?.error?.(msg);
    } finally {
      setResendLoading(false);
    }
  };

  // A small UI helper: individual input boxes for each digit (nice UX)
  const handleOtpChange = (value: string) => {
    // Remove non-digits and limit to 6
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setOtp(cleaned);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white border rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Verify your email</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the 6-digit verification code sent to <strong>{email ?? "your email"}</strong>.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex gap-2 justify-center">
            <input
              inputMode="numeric"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              className="appearance-none w-full max-w-[220px] text-center tracking-widest text-2xl border rounded py-2 px-2 focus:outline-none"
              placeholder="______"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              disabled={loading || !validateOtpFormat(otp)}
              className="flex-1 inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0 || loading}
              className="inline-flex items-center gap-2 rounded border px-3 py-2 disabled:opacity-60 cursor-pointer"
            >
              {resendLoading ? "Resending..." : cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>If you didn’t receive the email, check your spam folder or try resending.</p>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>Need to use a different email? <button onClick={() => { localStorage.removeItem("pending_verification_email"); router.push("/"); }} 
            className="text-primary underline cursor-pointer" disabled={loading}>
            Change email</button></p>
        </div>
      </div>
    </div>
  );
}
