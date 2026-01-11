"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Note } from "@/types/database";
import { updateNote } from "@/features/notes/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { Clock, Trash2, Loader2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/context/VaultContext";
import { VaultUnlockDialog } from "@/components/features/vault/VaultUnlockDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteNote } from "@/features/notes/actions";
import { useRouter } from "next/navigation";

interface NoteEditorProps {
  note: Note | null;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const { isVaultLocked, unlockVault } = useVault();
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Secure Note Guard
  if (note.type === "secure" && isVaultLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background h-full gap-4 text-center p-8">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Vault Locked</h2>
        <p className="text-muted-foreground max-w-sm">
          This note is secure. Please unlock your vault using the sidebar or the
          button below to view its contents.
        </p>

        {/* Simple inline unlock for convenience? Or redirect to sidebar? 
            Let's reuse the logic basically.
        */}
        {/* Dialog based unlock */}
        <VaultUnlockDialog>
          <Button
            variant="outline"
            className="mt-2 border-orange-200 hover:bg-orange-50 text-orange-700"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Unlock Vault
          </Button>
        </VaultUnlockDialog>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-background relative">
      {/* Sticky Header - Minimal */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium">
            {format(new Date(note.updated_at), "MMM d, h:mm a")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    "{note.title || "Untitled"}"
                  </span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    if (!note) return;
                    setIsDeleting(true);
                    try {
                      await deleteNote(note.id);
                      router.replace("/");
                      router.refresh();
                    } catch (error) {
                      console.error("Failed to delete note", error);
                      setIsDeleting(false);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto px-8 pb-10">
          <input
            className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-4 text-foreground"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full h-[calc(100vh-200px)] resize-none bg-transparent border-none outline-none text-lg leading-relaxed text-foreground/90 placeholder:text-muted-foreground/40 font-sans"
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
