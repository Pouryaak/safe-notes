"use client";

import React, { useState } from "react";
import { Note, Folder } from "@/types/database";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Lock,
  CheckSquare,
  Clock,
  MoreVertical,
  Copy,
  FolderInput,
  Trash2,
} from "lucide-react";
import { useVault } from "@/context/VaultContext";
import { FolderNode, buildFolderTree } from "@/features/folders/utils";
import { duplicateNote, moveNote, deleteNote } from "@/features/notes/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  folders: Folder[];
}

export function NoteList({ notes, selectedNoteId, folders }: NoteListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVaultLocked } = useVault();
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Helper to render folder menu items recursively
  const renderFolderItems = (nodes: FolderNode[], noteId: string) => {
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        {node.children && node.children.length > 0 ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="truncate max-w-[150px]">{node.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  moveNote(noteId, node.id);
                }}
              >
                Move here
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {renderFolderItems(node.children, noteId)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              moveNote(noteId, node.id);
            }}
          >
            <span className="truncate max-w-[150px]">{node.name}</span>
          </DropdownMenuItem>
        )}
      </React.Fragment>
    ));
  };

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

  const handleNoteClick = (noteId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("noteId", noteId);
    router.push(`?${params.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
      router.refresh();
      // If deleted note was selected, clear selection or move to inbox/first note?
      // Router refresh might handle it if the notes list updates and the selected ID is no longer valid,
      // but ideally we should redirect if the current note is deleted.
      // However, for list item delete, we might not be *viewing* that note.
      // If we ARE viewing it, we should probably redirect.
      if (selectedNoteId === noteToDelete) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
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
          onClick={() => handleNoteClick(note.id)}
          className={cn(
            "p-3 border-b border-border cursor-pointer hover:bg-muted/30 -mx-[1px] group",
            selectedNoteId === note.id &&
              "bg-primary/5 border-l-4 border-l-primary border-y-transparent border-r-transparent"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                "font-semibold truncate text-sm min-w-0 flex-1 max-w-[140px]",
                selectedNoteId === note.id ? "text-primary" : "text-foreground"
              )}
            >
              {note.title || "Untitled Note"}
            </div>

            {/* Metadata & Actions */}
            <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground/60 h-5">
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
              <span className="text-[10px] whitespace-nowrap">
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                })}
              </span>

              {/* 3-Dot Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-background/80 text-muted-foreground"
                    >
                      <MoreVertical size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-left">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateNote(note.id);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderInput className="mr-2 h-4 w-4" />
                        <span>Move to</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48 max-h-[300px] overflow-y-auto">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            moveNote(note.id, null);
                          }}
                        >
                          Inbox
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {renderFolderItems(
                          buildFolderTree(folders || []),
                          note.id
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground truncate opacity-80 mt-1 h-4 w-full max-w-[280px]">
            {note.type === "secure" && isVaultLocked ? (
              <span className="text-orange-600/70 flex items-center gap-1 font-medium italic">
                <Lock size={10} /> Content Encrypted
              </span>
            ) : (
              note.content
                ?.replace(/<[^>]+>/g, " ") // Replace tags with space
                .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
                .replace(/\s+/g, " ") // Collapse multiple spaces
                .trim()
                .slice(0, 60) || "No content"
            )}
          </div>
        </div>
      ))}

      <AlertDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
