"use client";

import React from "react";
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
} from "lucide-react";
import { useVault } from "@/context/VaultContext";
import { FolderNode, buildFolderTree } from "@/features/folders/utils";
import { duplicateNote, moveNote } from "@/features/notes/actions";
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

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  folders: Folder[];
}

export function NoteList({ notes, selectedNoteId, folders }: NoteListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVaultLocked } = useVault();

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
            // Removed overflow-hidden to help with popup positioning, ensuring children handle overflow
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

              {/* 3-Dot Menu - Always visible, small */}
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
              note.content?.slice(0, 60) || "No content"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
