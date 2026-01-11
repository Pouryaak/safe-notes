import { getNotes } from "@/features/notes/actions";
import { getFolders } from "@/features/folders/actions";
import { NoteList } from "@/features/notes/components/NoteList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NoteTypeToolbar } from "@/features/notes/components/NoteTypeToolbar";

import { SearchInput } from "@/components/common/SearchInput";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buildFolderTree } from "@/features/folders/utils";
import { cn } from "@/lib/utils";

// We need to fetch folder details too
async function getFolder(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ noteId?: string }>;
}) {
  const { id } = await params;
  const folder = await getFolder(id);
  const folders = await getFolders();
  const folderTree = buildFolderTree(folders);

  if (!folder) {
    notFound();
  }

  const notes = await getNotes(id);
  const { noteId } = await searchParams;

  const selectedNote = noteId
    ? notes.find((n) => n.id === noteId) || null
    : null;

  return (
    <div className="flex h-full w-full">
      {/* Note List Column */}
      <div
        className={cn(
          "w-full md:w-80 min-w-0 md:min-w-[20rem] md:max-w-[20rem] border-r border-border flex-col bg-card h-full shrink-0",
          noteId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b border-border flex items-center gap-2">
          <MobileNav folderTree={folderTree} />
          <h1 className="font-semibold text-lg truncate flex-1 text-foreground">
            {folder.name}
          </h1>
        </div>
        <div className="p-2 border-b border-border bg-muted/10">
          <SearchInput />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <NoteList notes={notes} selectedNoteId={noteId} folders={folders} />
        </div>
        <NoteTypeToolbar folderId={folder.id} />
      </div>

      {/* Editor Column */}
      <div
        className={cn(
          "flex-1 h-full bg-background overflow-hidden relative",
          noteId ? "flex" : "hidden md:flex"
        )}
      >
        <NoteEditor key={selectedNote?.id} note={selectedNote} />
      </div>
    </div>
  );
}
