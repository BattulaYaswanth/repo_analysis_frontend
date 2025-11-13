"use client"
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Hide navbar on '/' and '/auth/*'
  const hideNavbar =
    pathname === '/' || pathname.startsWith('/auth');
  return (
    <html lang="en">
      <body>
        <Providers>
          {!hideNavbar &&<Navbar />}
          {children}
          <Toaster/>
        </Providers>
      </body>
    </html>
  );
}
