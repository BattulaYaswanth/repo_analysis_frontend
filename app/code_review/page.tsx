"use client";

import * as React from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DropdownMenuDemo } from '@/components/Dropdown-Menu';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/context/store';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/code_review'; 
const INITIAL_CODE = `def is_palindrome(s):
    # Potential issue: converts int/list to string incorrectly
    return s == s[::-1]`;

export default function StreamingCodeReviewer() {
  const { data: session } = useSession();
  const [inputCode, setInputCode] = React.useState(INITIAL_CODE);
  const [reviewOutput, setReviewOutput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectLanguage, setSelectLanguage] = React.useState("");
  const { language, clearLanguage } = useLanguageStore();

  const handleReview = async () => {
    setReviewOutput(''); 
    setIsLoading(true);
    try {
      if (!language) {
        toast.error("Please select a programming language!");
        return;
      }
      
      if (inputCode.trim() === "") {
        toast.error("Code cannot be empty!");
        return;
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization':`Bearer ${session?.accessToken}` 
        },
        body: JSON.stringify({ code: inputCode, language: selectLanguage }),
      });

      if (!response.body) throw new Error('No response body for streaming.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setReviewOutput((prev) => prev + chunk);
      }
      clearLanguage();
    } catch (error) {
      console.error(`[ERROR]: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Something went wrong while reviewing the code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Responsive Container: flex-col for mobile, flex-row for lg screens
    <div className="min-h-screen w-full flex flex-col lg:flex-row items-start justify-center bg-gray-100 p-4 md:p-8 gap-6">
      
      {/* --- LEFT CARD: CODE INPUT --- */}
      <Card className="w-full lg:max-w-2xl shadow-xl border-slate-200 overflow-hidden flex-1">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 border-b py-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 rounded-md">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">Code Input</CardTitle>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <DropdownMenuDemo onSelect={(value) => setSelectLanguage(value)}
            disabled={isLoading} />
            <Button 
                onClick={handleReview} 
                disabled={isLoading || inputCode.trim() === ''}
                size="sm"
                className="whitespace-nowrap"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Start Review</>
              )}
            </Button>
          </div>
        </CardHeader>

        <div className="p-0">
          <Textarea
            disabled={isLoading}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            spellCheck={false}
            // 2. Responsive height for the textarea
            className="min-h-[300px] md:min-h-[500px] w-full resize-none rounded-none border-0 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 focus-visible:ring-0"
          />
        </div>
      </Card>

      {/* --- RIGHT CARD: REVIEW OUTPUT --- */}
      <Card className="w-full lg:max-w-2xl shadow-xl border-slate-200 overflow-hidden flex-1">
        <CardHeader className="flex flex-row items-center gap-2 bg-blue-50/50 border-b py-3">
          <CardTitle className="text-lg text-blue-800">Review Report</CardTitle>
        </CardHeader>
        
        {/* 3. Responsive height and scrollable area */}
        <div className="p-4 min-h-[300px] md:min-h-[500px] max-h-[600px] lg:max-h-[500px] overflow-y-auto bg-white">
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({node, className = '', children, ...props}) {
                            const isInline = 'inline' in props ? props.inline === true : false;
                            const match = /language-(\w+)/.exec(className || '');
                            return !isInline && match ? (
                                <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-sm border my-2">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            ) : (
                                <code className={cn("bg-gray-100 px-1 py-0.5 rounded text-pink-600 font-mono text-xs", className)} {...props}>
                                    {children}
                                </code>
                            )
                        }
                    }}
                >
                    {reviewOutput || (isLoading ? 'Receiving real-time analysis...' : 'Click "Start Review" to generate a report.')}
                </ReactMarkdown>
            </div>
        </div>
      </Card>
    </div>  
  );
}

// Helper to handle the spinner icon not imported in your snippet
function Loader2({ className }: { className?: string }) {
    return <Terminal className={cn("animate-pulse", className)} />;
}