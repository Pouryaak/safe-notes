import { Skeleton } from "@/components/ui/skeleton";

export function NoteEditorSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border h-16">
        <Skeleton className="h-8 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border h-12">
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Editor Content Skeleton */}
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full mt-8" />
      </div>
    </div>
  );
}
