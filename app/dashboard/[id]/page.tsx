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

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

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
  const { data: session } = useSession(); // ✅ useSession here
  const token = session?.accessToken;      // ✅ get token safely
  const { id } = React.use(params);
  const [repoName, setRepoName] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [totalFiles, setTotalFiles] = React.useState(0);
  const [languages, setLanguages] = React.useState<Record<string, number>>({});
  const [review, setReview] = React.useState("");
  const [docs, setDocs] = React.useState("");
  const [tests, setTests] = React.useState("");
  const [loading,setLoading] = React.useState(false)

  // 🧠 Fetch repo details using ID (replace URL with your backend API)
  React.useEffect(() => {
    async function fetchRepoDetails() {
      setLoading(true)
      try {
        // If you want to add authentication, retrieve the token here
        // e.g., const token = localStorage.getItem("token") or from context
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze_repo/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        );
        const data = res.data;

        setRepoName(data.repo_name ?? "");
        setRepoUrl(data.repo_url ?? "");
        setTotalFiles(data.total_files ?? 0);
        setLanguages(data.languages ?? {});
        setReview(data.review ?? "");
        setDocs(data.docs ?? "");
        setTests(data.tests ?? "");
      } catch (err: any) {
        console.error("❌ Failed to load repo details:", err);

        const message =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Unknown error occurred while fetching repository details.";

        // 🔔 Show toast notification
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  
    if (id) fetchRepoDetails();
  }, [id]);

  const totalLanguageCount = Object.values(languages ?? {}).reduce(
    (acc, count) => acc + count,
    0
  );

  return ( !loading &&
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Repo Analysis: <span className="text-primary">{repoName}</span>
        </h1>
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          URL:{" "}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 truncate max-w-xs"
          >
            {repoUrl}
          </a>
        </p>
      </header>

      {/* Overview Cards */}
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
              {Object.entries(languages ?? {})
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
                    textToCopy={String(value ?? "")}
                    className="bg-transparent border-none p-1 h-auto"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 overflow-x-auto">
                  {value ?? "No data available"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

