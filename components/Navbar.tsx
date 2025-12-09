"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Import useRouter
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, LogOut, Loader2 } from "lucide-react"; // Import Loader2 for the spinner
import axios from "axios";
import { toast } from "sonner";
import { useTransition } from "react"; // Import useTransition

// ... (navLinks remains the same)
const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  {href:"/all",label:"All Reviews"},
  {href:"/code_review",label:"Code Review"}
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const { data: session, status } = useSession();
  
  // 1. Initialize useTransition hook
  const [isPending, startTransition] = useTransition();

  const logOut = () => signOut({ callbackUrl: "/auth/signin" })
  
  // ... (deleteAccount function remains the same)
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
  }

  // 2. Navigation handler function
  const handleNavigation = (href: string) => {
    // Wrap the navigation in startTransition
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 px-4 py-2 flex items-center justify-between">
      {/* ... (Logo remains the same) */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Repo Analyzer
          </span>
        </Link>
      </div>

      {/* Main nav links */}
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          // 3. Replace Link with a Button/Div that calls handleNavigation
          <button
            key={link.href}
            onClick={() => handleNavigation(link.href)} // Use button/div to handle click
            disabled={isPending} // Disable link while navigation is pending
            className={cn(
              "transition-colors px-2 py-1 rounded disabled:opacity-60 disabled:cursor-not-allowed",
              pathname === link.href
                ? "text-cyan-600 font-semibold bg-cyan-100 dark:bg-cyan-950"
                : "text-gray-700 dark:text-gray-200 hover:text-cyan-500",
              // Use button styling for hover/focus
              "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            )}
            style={{
                // Manually setting cursor for better UX when pending
                cursor: isPending ? 'wait' : 'pointer'
            }}
          >
            {/* 4. Display a spinner/loading state if navigation is pending */}
            {isPending && pathname !== link.href ? (
                <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </div>
            ) : (
                link.label
            )}
          </button>
        ))}
      </div>
      
      {/* ... (Auth actions remains the same) */}
      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        ) : session ? (
          <>
            <span className="hidden sm:inline text-gray-700 dark:text-gray-200 px-2">
              {session.user?.email || session.user?.name}
            </span>
            <Button variant={"destructive"} className="cursor-pointer hover:bg-red-400 hover:text-white"
             onClick={deleteAccount}>
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
            <Button size="sm" variant="outline" className="cursor-pointer hover:bg-gray-200 hover:text-gray-700"
             onClick={logOut}>
              <LogOut className="w-4 h-4" />
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