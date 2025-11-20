// app/your-route-segment/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react"; // Using an icon for a spinner

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* This Navbar should be the same as the one in your main layout 
        or a static component that renders immediately.
      */}
      <header className="px-4 py-3 border-b shadow-sm flex justify-between items-center bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-24" /> {/* Logo Placeholder */}
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar Placeholder */}
        </div>
      </header>

      {/* Main Content Area: Use a container that matches your page's layout */}
      <main className="grow container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          <Skeleton className="h-10 w-1/3" /> {/* Title Placeholder */}
        </h1>
        
        {/* Visual Loading Indicator (Spinner) */}
        <div className="flex justify-center items-center py-12">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Loading Content...</span>
        </div>

        {/* Skeleton for Main Content (e.g., a card grid or form) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Repeat Skeleton cards to fill the space */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-[125px] w-full rounded-xl" /> {/* Image/Header Area */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" /> {/* Title/Heading */}
                <Skeleton className="h-4 w-11/12" /> {/* Text Line 1 */}
                <Skeleton className="h-4 w-2/3" /> {/* Text Line 2 */}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}