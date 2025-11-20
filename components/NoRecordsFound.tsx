

// --- Mocking Lucide React Icons (Replace with actual imports in your Next.js project) ---
const FileText = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);
import { useRouter } from "next/navigation";
// --- Mocking Shadcn Components (Replace with actual imports) ---
import type { ReactNode, SVGProps } from "react";
import { JSX } from "react/jsx-runtime";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-xl ${className}`}>
    {children}
  </div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
const Button = ({
  children,
  onClick = () => {},
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
  >
    {children}
  </button>
);

// Main Component
const NoRecordsFound = () => {
    const router = useRouter()
  // Handler for the button click
  const handleCreateNew = () => {
    router.push("/dashboard")
    router.refresh()
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950/50 backdrop-blur-sm">
        <CardContent className="py-12 px-6 sm:px-10">
          
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-6">
            <FileText className="h-8 w-8" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            No Records Found
          </h2>

          {/* Subtitle / Description */}
          <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
            It looks like this collection is empty. Start by creating a new record to populate this view.
          </p>

          {/* Action Button */}
          <Button 
            onClick={handleCreateNew}
            className="w-full sm:w-auto shadow-lg hover:shadow-blue-500/50 dark:shadow-blue-900/50"
          >
           Repo Analysis
          </Button>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default NoRecordsFound;