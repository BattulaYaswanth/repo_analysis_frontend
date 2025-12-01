  import { Suspense } from "react";
  import OTPPage from "@/components/OtpPage";

export const dynamic = "force-dynamic"; // Prevent static pre-render

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPPage />
    </Suspense>
  );
}
