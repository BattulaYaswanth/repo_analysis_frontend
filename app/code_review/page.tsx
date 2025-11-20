'use client';

import * as React from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// 🌟 NEW IMPORTS FOR MARKDOWN RENDERING
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DropdownMenuDemo } from '@/components/Dropdown-Menu';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/context/store';

// --- Configuration ---
const API_URL = 'http://localhost:8000/api/code_review'; 
const INITIAL_CODE = 
`def is_palindrome(s):
    # Potential issue: converts int/list to string incorrectly
    return s == s[::-1]`;

export default function StreamingCodeReviewer() {
  const{data:session} = useSession()
  const [inputCode, setInputCode] = React.useState(INITIAL_CODE);
  const [reviewOutput, setReviewOutput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectLanguage, setSelectLanguage] = React.useState("");
  const { language,clearLanguage } = useLanguageStore();

  // --- Core Streaming Logic (Unchanged) ---
  const handleReview = async () => {
    setReviewOutput(''); 
    setIsLoading(true);
    try {
      console.log("Selected Language:", language); // <-- HERE
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
        headers: { 'Content-Type': 'application/json','Authorization':`Bearer ${session?.accessToken}` },
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
      clearLanguage()
    } catch (error) {
      setReviewOutput((prev) => prev + `\n\n[ERROR]: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen w-full flex items-start justify-center bg-gray-100 p-8 space-x-6">
      
      {/* --- LEFT CARD: CODE INPUT (Omitted for brevity) --- */}
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b py-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 rounded-md">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-lg">Code Input</CardTitle>
        </div>

        {/* Pass callback to dropdown */}
        <DropdownMenuDemo onSelect={(value) => setSelectLanguage(value)} />

        <Button onClick={handleReview} disabled={isLoading || inputCode.trim() === ''}>
          {isLoading ? 'Reviewing...' : (
            <>
              <Send className="mr-2 h-4 w-4" /> Start Review
            </>
          )}
        </Button>
      </CardHeader>

      <div className="p-0">
        <Textarea
          disabled={isLoading}
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          spellCheck={false}
          className="min-h-[500px] w-full resize-y rounded-none border-0 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 focus-visible:ring-0"
        />
      </div>
    </Card>

      {/* --- RIGHT CARD: REVIEW OUTPUT (Prettified Markdown) --- */}
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2 bg-blue-50/50 border-b py-3">
          <CardTitle className="text-lg text-blue-800">Review Report</CardTitle>
        </CardHeader>
        
        {/* 🌟 SCROLLABLE CONTAINER with fixed height */}
        <div className="p-4 min-h-[500px] max-h-[500px] overflow-y-auto bg-white">
            
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom renderer for code blocks (```python ... ```)
                    code({node, className = '', children, ...props}) {
                        // The inline prop may not be present, so infer from props
                        const isInline = 'inline' in props ? props.inline === true : false;
                        const match = /language-(\w+)/.exec(className || '');
                        return !isInline && match ? (
                            // For multiline code blocks, use a dedicated styling (like Shadcn's)
                            <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-sm border">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            // For inline code (`code`)
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {/* Display the streamed output here */}
                {reviewOutput || (isLoading ? 'Receiving real-time analysis...' : 'Click "Start Review" to generate a report.')}
            </ReactMarkdown>
        </div>
      </Card>
    </div>  
  );
}