"use client";

interface loadingProps{
    statusText:string
}

const ProgressBarPage = ({statusText}:loadingProps) => {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      
      {/* Card Container */}
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl border bg-card shadow-xl">

        {/* Branding / Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 bg-primary rounded-full animate-pulse mb-3"></div>

          <h1 className="text-3xl font-bold text-primary">RepoScan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analysing Repo Data...
          </p>
        </div>

        {/* Spinner Animation */}
        <div className="flex justify-center">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        {/* Status Text */}
        <div className="text-center text-sm font-medium text-primary">
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default ProgressBarPage;
