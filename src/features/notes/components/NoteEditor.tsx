"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Note } from "@/types/database";
import { updateNote } from "@/features/notes/actions";
import { TiptapEditor } from "./TiptapEditor";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  ChevronLeft,
} from "lucide-react";
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

interface NoteEditorProps {
  note: Note | null;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVaultLocked, unlockVault } = useVault();
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("noteId");
    router.push(`/?${params.toString()}`);
  };

  // Update local state when note changes (selection change)
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [note?.id]);

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
      {/* Meta Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Title & Meta Area */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 pt-6 pb-2 flex items-start gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2 shrink-0 text-muted-foreground"
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <input
            className="flex-1 text-2xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground min-w-0 mt-0.5 md:mt-0"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2 shrink-0">
            <span className="text-muted-foreground/60 text-[10px] md:text-xs text-nowrap hidden sm:inline-block">
              {format(new Date(note.updated_at), "MMM d, h:mm a")}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
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
                    ?
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

        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          <TiptapEditor
            key={note.id} // Important for remounting on note switch
            content={content}
            onChange={setContent}
          />
        </div>
      </div>
    </div>
  );
}
