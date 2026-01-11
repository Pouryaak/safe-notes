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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
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
                      router.replace("/"); // Go to inbox or root
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
