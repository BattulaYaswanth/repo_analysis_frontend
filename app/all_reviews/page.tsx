"use client";

import axios from "axios";
import { Link2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NoRecordsFound from "@/components/NoRecordsFound";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Card = ({ className = "", children,onClick }: { onClick?:()=>void;className?: string; children: React.ReactNode }) => (
  <div onClick={onClick} className={`rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-lg font-semibold leading-tight tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
// --- END MOCK COMPONENTS ---

interface ReviewData {
  _id: string;
  owner: string;
  email: string;
  repo_name: string;
  repo_url: string;
  languages: Record<string, number>;
  total_files: number;
  has_readme: boolean;
  status: string;
  review: string;
  docs: string;
  tests: string;
}


const App: React.FC = () => {
  const [reviewsData, setReviewsData] = useState<ReviewData[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.accessToken) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reviews`,
          {
            params: { email: session.user?.email },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        setReviewsData(res.data.reviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [status, session]);

  if(reviewsData.length == 0){
    return(
      <NoRecordsFound/>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
          Repo Reviews ({reviewsData.length})
        </h1>
      </header>

      {/* Grid */}
            
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reviewsData.map((review) => (
          <Card
            key={review._id}
            className="relative group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 hover:-translate-y-0.5"
            onClick={() => { 
              router.push(`/dashboard/${review._id}`)
              router.refresh()
            }}
          >
            {/* Delete Button (top right corner, prevent parent click) */}
            <Button
              className="absolute top-3 right-3 z-10 opacity-75 group-hover:opacity-100 bg-red-600 hover:bg-red-300 text-white p-1 rounded shadow transition"
              title="Delete Review"
              onClick={async (e) => {
                e.stopPropagation();
                if (!window.confirm("Are you sure you want to delete this review?")) return;
                try {
                  const res =await axios.delete(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/review/delete/${review._id}`,
                    {
                      headers: { Authorization: `Bearer ${session?.accessToken || ""}` }
                    }
                  );
                  // Remove deleted review from UI
                  setReviewsData(reviewsData => reviewsData.filter(r => r._id !== review._id));
                  toast.success(res.data.message);
                } catch (error) {
                  console.error("Error deleting review:", error);
                  toast.error((error as any).response.data.message);
                }
              }}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
              }}
            >
              <span className="sr-only">Delete</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
              </svg>
            </Button>

            <CardHeader>
              <CardTitle className="mt-2 text-xl line-clamp-2">
                {review.repo_name}
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-1">
                {review.status}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-base text-gray-700 dark:text-gray-200 line-clamp-5 min-h-30 mb-4">
                {review.review}
              </p>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                <div className="font-semibold text-primary dark:text-blue-400">
                  {review.owner}
                </div>

                <CardDescription className="text-xs flex items-center gap-1">
                  <Link href={review.repo_url} target="_blank" onClick={e => e.stopPropagation()}>
                    <Link2 className="inline-block w-4 h-4" /><span className="font-bold ml-2 ">Repo Link</span>
                  </Link>
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;
