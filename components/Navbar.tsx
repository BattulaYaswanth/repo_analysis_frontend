"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, LogOut, Loader2, Menu, X } from "lucide-react"; 
import axios from "axios";
import { toast } from "sonner";
import { useTransition, useState } from "react"; // Added useState

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/all_reviews", label: "All Reviews" },
  { href: "/code_review", label: "Code Review" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  
  // State for mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logOut = () => signOut({ callbackUrl: "/auth/signin" });
  
  const deleteAccount = async () => {
    try {
      const email = session?.user?.email;
      const result = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${email}`, {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`
        }
      });
      
      if (result.status === 200 || result.status === 204) {
        toast.success("Account deleted successfully!"); 
        logOut();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Failed to delete account.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleNavigation = (href: string) => {
    setMobileMenuOpen(false); // Close menu on click
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="relative bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 px-4 py-2 flex items-center justify-between">
      
      {/* LEFT: Logo & Mobile Toggle */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg md:text-xl font-bold tracking-tight bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Repo Analyzer
          </span>
        </Link>
      </div>

      {/* CENTER: Desktop Nav Links (Hidden on small screens) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        {navLinks.map((link) => (
          <Link
          key={link.href}
          href={link.href}
          className={cn(
            "transition-colors px-3 py-1.5 rounded-md text-sm",
            pathname === link.href
              ? "text-cyan-600 font-semibold bg-cyan-100 dark:bg-cyan-950"
              : "text-gray-700 dark:text-gray-200 hover:text-cyan-500"
          )}
        >
          {link.label}
        </Link>
        ))}
      </div>
      
      {/* RIGHT: Auth Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {status === "loading" ? (
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        ) : session ? (
          <>
            <span className="hidden xl:inline text-xs text-gray-500 dark:text-gray-400 px-2 ">
              {session.user?.email}
            </span>
            
            <Button 
              variant="destructive" 
              size="sm"
              className="px-2 sm:px-3"
              onClick={deleteAccount}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-2 text-xs">Delete</span>
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              className="px-2 sm:px-3"
              onClick={logOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2 text-xs">Sign Out</span>
            </Button>
          </>
        ) : (
          <Link href="/auth/signin">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>

      {/* MOBILE OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 p-4 space-y-2 shadow-xl md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavigation(link.href)}
              className={cn(
                "w-full text-left p-3 rounded-lg text-sm transition-colors",
                pathname === link.href
                  ? "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 font-bold"
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}