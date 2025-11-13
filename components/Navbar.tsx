"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 px-4 py-2 flex items-center justify-between">
      {/* Logo or app name */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            MyApp
          </span>
        </Link>
      </div>
      {/* Main nav links */}
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-cyan-500 px-2 py-1 rounded",
              pathname === link.href
                ? "text-cyan-600 font-semibold bg-cyan-100 dark:bg-cyan-950"
                : "text-gray-700 dark:text-gray-200"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* Auth actions */}
      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        ) : session ? (
          <>
            <span className="hidden sm:inline text-gray-700 dark:text-gray-200 px-2">
              {session.user?.email || session.user?.name}
            </span>
            <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/auth/signin">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
