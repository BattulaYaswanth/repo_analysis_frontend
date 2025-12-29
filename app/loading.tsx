// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
        <p className="text-muted-foreground animate-pulse">Loading Page...</p>
      </div>
    </div>
  );
}