"use client";

import { Note } from "@/types/database";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Lock, CheckSquare, Clock } from "lucide-react";

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
}

export function NoteList({ notes, selectedNoteId }: NoteListProps) {
  const router = useRouter();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "secure":
        return <Lock size={12} className="text-orange-600" />;
      case "todo":
        return <CheckSquare size={12} className="text-blue-600" />;
      case "reminder":
        return <Clock size={12} className="text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {notes.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No notes here yet.
        </div>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => router.push(`?noteId=${note.id}`)}
          className={cn(
            "p-5 border-b border-border cursor-pointer transition-all text-left hover:bg-muted/30 -mx-[1px]",
            selectedNoteId === note.id &&
              "bg-primary/5 border-l-4 border-l-primary border-y-transparent border-r-transparent"
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className={cn(
                "font-semibold truncate pr-2 text-sm",
                selectedNoteId === note.id ? "text-primary" : "text-foreground"
              )}
            >
              {note.title || "Untitled Note"}
            </div>
            {note.type !== "general" && (
              <span
                className={cn(
                  "p-1 rounded bg-opacity-10 flex items-center justify-center",
                  note.type === "secure" && "bg-orange-100",
                  note.type === "todo" && "bg-blue-100",
                  note.type === "reminder" && "bg-purple-100"
                )}
                title={note.type.toUpperCase()}
              >
                {getTypeIcon(note.type)}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate my-1 opacity-90">
            {note.content?.slice(0, 50) || "No content"}
          </div>
          <div className="text-[10px] text-muted-foreground/70 flex items-center gap-2 mt-2">
            <span>
              {formatDistanceToNow(new Date(note.updated_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
