"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from "next/link";
import ErrorPage from "@/components/ErrorPage";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

// --- Data Structure for Combined State ---
interface RepoDataState {
  repoName: string;
  repoUrl: string;
  totalFiles: number;
  languages: Record<string, number>;
  review: string;
  docs: string;
  tests: string;
  used_model:string;
}

// --- CodeCopyButton Component (No changes) ---
const CodeCopyButton = ({
  textToCopy,
  className,
}: {
  textToCopy: string;
  className?: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={copyToClipboard}
      className={className}
      variant="outline"
      size="sm"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="mr-1 h-3 w-3 text-green-400" />
      ) : (
        <Copy className="mr-1 h-3 w-3 text-green-400" />
      )}
      <span className="text-green-400 text-xs">
        {copied ? "Copied!" : "Copy"}
      </span>
    </Button>
  );
};

export default function DashboardPage({ params }: DashboardPageProps) {
  const[error,setError] = React.useState("")
  const[errorCode,setErrorCode] = React.useState("")
  const[errorMessage,setErrorMessage] = React.useState("")
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const { id } = React.use(params);
  // Use a single state object for data
  const [repoData, setRepoData] = React.useState<RepoDataState>({
    repoName: "",
    repoUrl: "",
    totalFiles: 0,
    languages: {},
    review: "",
    docs: "",
    tests: "",
    used_model:""
  });
  
  // Set loading to true initially
  const [loading, setLoading] = React.useState(true);

  // --- Fetch Data Effect ---
  React.useEffect(() => {
    // ⭐ 1. Wait until NextAuth finishes
    if (status === "loading") return;

    // ⭐ 2. If user is not authenticated → show message
    if (status === "unauthenticated") {
      setLoading(false);
      toast.error("You must be logged in to view this repository.");
      return;
    }

    // ⭐ 3. If a token is missing → avoid crashing fetch
    if (!token) {
      setLoading(false);
      toast.error("Session expired. Please log in again.");
      return;
    }

    // ⭐ 4. Now fetch the data
    async function fetchRepoDetails() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze_repo/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;
        setRepoData({
          repoName: data.repo_name ?? "N/A",
          repoUrl: data.repo_url ?? "",
          totalFiles: data.total_files ?? 0,
          languages: data.languages ?? {},
          review: data.review ?? "No analysis available.",
          docs: data.docs ?? "No documentation data.",
          tests: data.tests ?? "No test details available.",
          used_model: data.used_model ?? "N/A"
        });
      } catch (err: any) {
        const statusCode = err?.response?.status;
        const detail = err?.response?.data?.detail;
        toast.error(err.response?.data?.detail || "Failed to load repository.");
         // ⛔ Friendly handling
        if (statusCode === 400) {
          toast.error("❌ Invalid repository ID format.");
          setErrorMessage("Invalid repository ID format.")
        } 
        else if (statusCode === 404) {
          toast.error("❌ Repository not found. Maybe the ID is wrong?");
          setErrorMessage("Repository not found. Maybe the ID is wrong?")
        } 
        else if (statusCode === 401) {
          toast.error("❌ Session expired. Please login again.");
          setErrorMessage(" Session expired. Please login again.")
        } 
        else {
          toast.error(`❌ Unexpected Error: ${detail || err.message}`);
          setErrorMessage(`Unexpected Error: ${detail || err.message}`)
        }
      // Hide console noise
      console.warn("Repo fetch failed:", { statusCode, detail });
      setError(detail)
      setErrorCode(statusCode)
    } finally {
        setLoading(false);
      }
    }

    fetchRepoDetails();
  }, [id, status, token]) // ⚠️ FIX: Added token and status to dependencies

  // Destructure for cleaner rendering
  const { repoName, repoUrl, totalFiles, languages, review, docs, tests,used_model } = repoData;

  const totalLanguageCount = Object.values(languages).reduce(
    (acc, count) => acc + count,
    0
  );

  // --- Conditional Rendering for Loading ---
  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex items-center justify-center h-screen">
        <span className="animate-spin mr-3 text-2xl">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </span>
        Loading repository analysis...
      </div>
    );
  }

  if(error){
    return(
      <ErrorPage title={error} statusCode={Number(errorCode)} message={errorMessage}/>
    )
  }

  // --- Main Content ---
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Repo Analysis: <span className="text-primary">{repoName}</span>
        </h1>
        URL :- <Link href={repoUrl} target="/" className="text-blue-500">{repoUrl}</Link>
      </header>

      {/* Overview Cards */}
      {/* ... (Total Files and Primary Languages Cards) ... */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">Files Analyzed</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Primary Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(languages)
                .sort(([, a], [, b]) => b - a)
                .map(([lang, count]) => (
                  <Badge
                    key={lang}
                    variant="default"
                    className="text-sm bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {lang} (
                    {totalLanguageCount > 0
                      ? ((count / totalLanguageCount) * 100).toFixed(1)
                      : 0}
                    %)
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Model Used</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{used_model}</div>
                  <p className="text-xs text-muted-foreground">Model Used</p>
              </CardContent>
          </Card>
      </div>

      <hr className="my-8" />

      {/* Tabs */}
      <h2 className="text-2xl font-semibold mb-4">Code Quality Summary</h2>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        {([
          ["review", review],
          ["docs", docs],
          ["tests", tests],
        ] as const).map(([key, value]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">{key}</CardTitle>
                <div className="bg-black p-1 rounded-md">
                  <CodeCopyButton
                    textToCopy={String(value)}
                    className="bg-transparent border-none p-1 h-auto"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ReactMarkdown 
                  // The content to be formatted
                  children={value || "No data available"} 

                  // Allows rendering raw HTML if your markdown includes it
                  rehypePlugins={[rehypeRaw]}

                  // Apply Tailwind styles to the rendered content
                  // className="prose dark:prose-invert max-w-none" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}