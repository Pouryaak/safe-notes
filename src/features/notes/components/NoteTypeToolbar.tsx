"use client";

import { useState } from "react";
import { createNote } from "../actions";
import { FileText, Shield, CheckSquare, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRouter, useSearchParams } from "next/navigation";

export function NoteTypeToolbar({ folderId }: { folderId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const handleCreate = async (
    type: "general" | "secure" | "todo" | "reminder"
  ) => {
    if (isCreating) return;
    setIsCreating(type);

    try {
      const newNote = await createNote(folderId, type);
      if (newNote) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("noteId", newNote.id);
        router.push(`?${params.toString()}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      setIsCreating(null); // Reset on error
    }
    // We don't reset isCreating on success because navigation/refresh will happen
    // and ideally we want to prevent double clicks until then.
    // The component might unmount or re-render.
  };

  return (
    <div className="p-3 border-t border-border grid grid-cols-4 gap-2 bg-muted/20 pb-safe">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-primary hover:bg-primary/10 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("general")}
              disabled={!!isCreating}
            >
              {isCreating === "general" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              {/* Optional label for better mobile UX? Or just icon? Keeping icon for now but larger target */}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>General Note</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("secure")}
              disabled={!!isCreating}
            >
              {isCreating === "secure" ? (
                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Secure Note</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("todo")}
              disabled={!!isCreating}
            >
              {isCreating === "todo" ? (
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              ) : (
                <CheckSquare className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>To-Do List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("reminder")}
              disabled={!!isCreating}
            >
              {isCreating === "reminder" ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reminder</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
