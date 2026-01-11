"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Note } from "@/types/database";
import { updateNote } from "@/features/notes/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteEditorProps {
  note: Note | null;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  // Update local state when note changes (selection change)
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [note?.id]); // Only when ID changes to avoid conflict with typing

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 1000);

  const handleSave = useCallback(
    async (updates: Partial<Note>) => {
      if (!note) return;
      try {
        await updateNote(note.id, updates);
      } catch (error) {
        console.error("Failed to save note:", error);
      }
    },
    [note]
  );

  // Effect for title save
  useEffect(() => {
    if (note && debouncedTitle !== (note.title || "")) {
      handleSave({ title: debouncedTitle });
    }
  }, [debouncedTitle, note, handleSave]);

  // Effect for content save
  useEffect(() => {
    if (note && debouncedContent !== (note.content || "")) {
      handleSave({ content: debouncedContent });
    }
  }, [debouncedContent, note, handleSave]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full text-muted-foreground">
        Select a note to view or create a new one.
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-background relative">
      {/* Sticky Header */}
      <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="p-2 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Last Edited
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {format(new Date(note.updated_at), "MMMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        {/* Actions Placeholder (Delete, etc) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <Input
            className="w-full text-4xl font-bold text-foreground placeholder:text-muted-foreground/30 border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent mb-6"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            className="w-full h-[calc(100vh-300px)] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-lg leading-relaxed font-sans text-foreground/80 placeholder:text-muted-foreground/40 bg-transparent"
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
