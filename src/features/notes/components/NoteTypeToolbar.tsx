"use client";

import { createNote } from "../actions";
import { FileText, Shield, CheckSquare, Clock } from "lucide-react";
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

  const handleCreate = async (
    type: "general" | "secure" | "todo" | "reminder"
  ) => {
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
    }
  };

  return (
    <div className="p-2 border-t border-border grid grid-cols-4 gap-1 bg-muted/20">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => handleCreate("general")}
            >
              <FileText className="h-4 w-4" />
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
              size="icon"
              className="w-full text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
              onClick={() => handleCreate("secure")}
            >
              <Shield className="h-4 w-4" />
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
              size="icon"
              className="w-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => handleCreate("todo")}
            >
              <CheckSquare className="h-4 w-4" />
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
              size="icon"
              className="w-full text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
              onClick={() => handleCreate("reminder")}
            >
              <Clock className="h-4 w-4" />
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
