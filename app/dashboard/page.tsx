"use client";
import ProgressBarPage from "@/components/ProgressBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowRight, Github } from "lucide-react"; // Consistent iconography
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";

type JobStatus = "queued" | "processing" | "completed" | "failed";

interface AnalyzeStatusResponse {
  status: JobStatus;
  message?: string;
  error?: string;
}

interface AnalyzeProgressResponse {
  progress: number; // 0–100
}


const Dashboard = () => {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const router = useRouter();
  const [repo_url, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false); // Used for initial button click
  const [progress, setProgress] = useState(0);
  const [progressStart, setProgressStart] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const POLLING_INTERVAL = 5000;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo_url.includes("github.com")) {
        toast.error("Please provide a valid GitHub URL");
        return;
    }

    setLoading(true);
    setProgressStart(true);
    
    let jobId = ''; 
    
    try {
        const submitRes = await apiClient.post("/api/analyze_repo", {
                        repo_url,
                        });

        const { id, status: submitStatus } = submitRes.data;
        jobId = id;
        
        if (submitStatus === 'success') {
            router.push(`/dashboard/${jobId}`);
            return;
        }
        
        let jobStatus = submitStatus; 

        while (jobStatus !== "completed" && jobStatus !== "failed") {
                await delay(POLLING_INTERVAL);

                const [statusRes, progressRes] = await Promise.all([
                    apiClient.get<AnalyzeStatusResponse>(
                    `/api/analyze_repo/status/${jobId}`
                    ),
                    apiClient.get<AnalyzeProgressResponse>(
                    `/api/analyze_repo/progress/${jobId}`
                    ),
                ]);

                const { status, message, error } = statusRes.data;
                const { progress } = progressRes.data;

                // UI smoothing (avoid jumping to 100% before redirect)
                setProgress(progress === 100 ? 99 : progress);

                setStatusText(
                    message ?? "Analyzing repository structure..."
                );

                jobStatus = status;

                if (status === "completed") {
                    router.push(`/dashboard/${jobId}`);
                    router.refresh();
                    break;
                }

                if (status === "failed") {
                    throw new Error(error ?? "Analysis failed.");
                }
        }
    } catch (err: any) {
        const errorMsg = err.response?.data?.detail || err.message || "Something went wrong";
        console.error("Analysis Error:", errorMsg);
        toast.error("Something went wrong");
        setProgressStart(false); // Only stop progress if it fails
    } finally {
        setLoading(false);
    }
  }

  // --- RENDERING ---

  if (progressStart) {
      return <ProgressBarPage statusText={statusText}/>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/20">
      <main className="container mx-auto px-4 py-12 md:py-24 lg:py-32">

        <section className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-6">
                <Github className="w-3 h-3" />
                <span>Now supporting public repositories</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
                Analyze Your <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600">GitHub</span> Repo
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Instantly generate documentation, visualize dependencies, and uncover insights for any public GitHub repository.
            </p>

            <div className="mx-auto w-full max-w-2xl bg-card p-2 sm:p-4 rounded-2xl border border-border shadow-2xl transition-all hover:shadow-indigo-500/5">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative grow">
                        <input
                            type="url"
                            placeholder="https://github.com/username/repo"
                            className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-all"
                            required
                            value={repo_url}
                            onChange={(e) => setRepoUrl(e.target.value)}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading || !repo_url}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Analyze <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </Button>
                </form>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 italic">
                    *Requires a public repository URL. High-traffic repos may take longer.
                </p>
            </div>
        </section>
        
        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <FeatureCard 
                icon="🛠️" 
                title="Dependency Tree" 
                desc="Visualize your project's entire dependency graph instantly." 
                color="indigo" 
            />
            <FeatureCard 
                icon="📝" 
                title="Auto-Docs" 
                desc="Generate comprehensive markdown docs for complex modules." 
                color="purple" 
            />
            <FeatureCard 
                icon="📈" 
                title="Health Score" 
                desc="Receive a detailed report on maintainability and best practices." 
                color="green" 
            />
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-slate-50/50 dark:bg-transparent">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
            <p className="font-medium text-sm">&copy; 2025 RepoScan</p>
            <div className="flex space-x-8 mt-6 md:mt-0 text-sm">
                <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-indigo-500 transition-colors">Support</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Feature Card to keep JSX clean
const FeatureCard = ({ icon, title, desc, color }: { icon: string, title: string, desc: string, color: string }) => (
    <div className="group p-8 bg-card rounded-2xl border border-border shadow-sm hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
        <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform inline-block`}>{icon}</div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
);

export default Dashboard;
