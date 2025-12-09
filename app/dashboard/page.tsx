"use client";
import ProgressBarPage from "@/components/ProgressBar";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: session,status } = useSession(); // ✅ useSession here
  const token = session?.accessToken;      // ✅ get token safely
  const router = useRouter();
  const [repo_url,setRepoUrl] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress,setProgress] = useState(0)
  const [progressStart,setProgressStart] = useState(false)
  const [statusText,setStatusText] = useState("")

  useEffect(() => {
    setLoading(true)
    try {
      if (status === "loading") return; // Wait until NextAuth finishes

      if (status === "unauthenticated") {
        router.push("/auth/signin");
      }
    } catch (error) {
      console.log(error)
    }
    finally{
      setLoading(false)
    }
}, [status]);

const POLLING_INTERVAL = 10000; // Poll every 10 seconds

// Helper function to wait
const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setProgressStart(true);
  setError('');
  
  let jobId = ''; // Initialize jobId outside try block for wider scope
  
  try {
      // === 1. SUBMIT JOB ===
      const submitRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze_repo`,
          { repo_url },
          {
              headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
          }
      );

      // Destructure ID and status from the successful submission
      const { id, status: submitStatus } = submitRes.data;
      jobId = id; // Assign to outer scope variable
      
      if (submitStatus === 'success') {
          // Case 1: Job was already completed (initial cache hit)
          // ACTION: Redirect immediately
          router.push(`/dashboard/${jobId}`);
          router.refresh();
          return; // Exit the function after success
      }
      
      // === 2. POLLING LOOP ===
      let jobStatus = submitStatus; 

      while (jobStatus !== 'completed' && jobStatus !== 'failed') {
          await delay(POLLING_INTERVAL); // Ensure delay is defined in your file
          
          const pollRes = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze_repo/status/${jobId}`,
              {
                  headers: {
                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
              }
          );

          const progressRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze_repo/progress/${jobId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if(progressRes.data.progress === 100){
            setProgress(99); 
          }else{
            setProgress(progressRes.data.progress); 
          }

          jobStatus = pollRes.data.status;

          if (jobStatus === 'completed') {
              // ACTION: Redirect immediately when completed status is received
              router.push(`/dashboard/${jobId}`);
              router.refresh();
              // IMPORTANT: Now we rely on the redirect to stop the loading state via the 'finally' block
              break; // Exit the loop
          } else if (jobStatus === 'failed') {
              // ACTION: Throw the error to be caught by the catch block
              throw new Error(`Analysis failed: ${pollRes.data.error || 'Check backend logs.'}`);
          }
      }
      
      // Removed `return result;` as the redirect now handles the exit flow
      
  } catch (err: any) {
      console.error("Analysis Polling Error:", err);
      // ... (Error handling logic remains here) ...
      const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          (typeof err.response?.data === "string" ? err.response.data : null) ||
          err.message ||
          "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
      
  } finally {
      // This is correctly placed to run after try/catch block finishes (success or failure)
      setProgressStart(false);
  }
}



  return (progressStart ? <ProgressBarPage progress={progress} statusText={statusText}/> :
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">

          <section className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-center">
              Analyze Your <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">GitHub</span> Repo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Instantly generate documentation, visualize dependencies, and uncover insights for any public GitHub repository.
            </p>

            <div className="Card p-4 md:p-6 lg:p-8 shadow-xl border border-border rounded-xl w-full max-w-2xl mx-auto transition-all hover:shadow-2xl">
              <form className="flex flex-col gap-3 sm:flex-row sm:gap-2" >
                
                <div className="relative grow">
                  <label htmlFor="repo-url" className="sr-only">GitHub Repository URL</label>
                  <input
                    id="repo-url"
                    type="url"
                    placeholder="Paste your GitHub URL here (e.g., https://github.com/shadcn/ui)"
                    className="Input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    onChange={(e)=>setRepoUrl(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg hidden sm:block">
                      </span>
                </div>

                <button type="submit" onClick={handleSubmit} disabled={loading || progressStart}
                 className="Button inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                  Analyze <span className="ml-2 hidden sm:inline-block">Repo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </form>
              <p className="text-xs text-muted-foreground mt-3 text-left sm:text-center">
                *Supports public repositories on **github.com** only. Analysis is free.
              </p>
            </div>
          </section>
          
          <div className="mt-20 flex items-center justify-center">
              <hr className="Separator w-1/2 max-w-md border-t border-border" />
          </div>

          <section className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">Features Built for Developers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="Card p-6 bg-card text-card-foreground rounded-lg border border-border shadow-md hover:shadow-lg transition-shadow">
                      <div className="text-3xl text-indigo-500 mb-3">🛠️</div>
                      <h3 className="font-semibold text-lg mb-2">Dependency Tree</h3>
                      <p className="text-sm text-muted-foreground">Visualize your project's entire dependency graph instantly.</p>
                  </div>
                  <div className="Card p-6 bg-card text-card-foreground rounded-lg border border-border shadow-md hover:shadow-lg transition-shadow">
                      <div className="text-3xl text-purple-500 mb-3">📝</div>
                      <h3 className="font-semibold text-lg mb-2">Auto-Documentation</h3>
                      <p className="text-sm text-muted-foreground">Generate comprehensive markdown docs for complex modules.</p>
                  </div>
                  <div className="Card p-6 bg-card text-card-foreground rounded-lg border border-border shadow-md hover:shadow-lg transition-shadow">
                      <div className="text-3xl text-green-500 mb-3">📈</div>
                      <h3 className="font-semibold text-lg mb-2">Code Health Score</h3>
                      <p className="text-sm text-muted-foreground">Receive a detailed report on maintainability and best practices.</p>
                  </div>
              </div>
          </section>
        </main>
        <footer className="mt-24 border-t border-border py-8 text-sm bg-background">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-8 text-muted-foreground">
            <p>&copy; 2025 RepoScan. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="https://github.com" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
</div>
  );
};

export default Dashboard;


