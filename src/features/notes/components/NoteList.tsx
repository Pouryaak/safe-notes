"use client";

import { Note } from "@/types/database";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Lock, CheckSquare, Clock } from "lucide-react";
import { useVault } from "@/context/VaultContext";

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
}

export function NoteList({ notes, selectedNoteId }: NoteListProps) {
  const router = useRouter();
  const { isVaultLocked } = useVault();

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
            "p-3 border-b border-border cursor-pointer transition-all text-left hover:bg-muted/30 -mx-[1px] group overflow-hidden",
            selectedNoteId === note.id &&
              "bg-primary/5 border-l-4 border-l-primary border-y-transparent border-r-transparent"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "font-semibold truncate text-sm min-w-0 flex-1",
                selectedNoteId === note.id ? "text-primary" : "text-foreground"
              )}
            >
              {note.title || "Untitled Note"}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {note.type !== "general" && (
                <span
                  className={cn(
                    "p-0.5 rounded bg-opacity-10 flex items-center justify-center",
                    note.type === "secure" && "bg-orange-100",
                    note.type === "todo" && "bg-blue-100",
                    note.type === "reminder" && "bg-purple-100"
                  )}
                  title={note.type.toUpperCase()}
                >
                  {getTypeIcon(note.type)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground truncate opacity-80 mt-1 h-4 w-full max-w-[280px]">
            {note.type === "secure" && isVaultLocked ? (
              <span className="text-orange-600/70 flex items-center gap-1 font-medium italic">
                <Lock size={10} /> Content Encrypted
              </span>
            ) : (
              note.content?.slice(0, 60) || "No content"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
