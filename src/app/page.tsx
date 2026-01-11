import { getNotes } from "@/features/notes/actions";
import { getFolders } from "@/features/folders/actions";
import { NoteList } from "@/features/notes/components/NoteList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NoteTypeToolbar } from "@/features/notes/components/NoteTypeToolbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buildFolderTree } from "@/features/folders/utils";
import { cn } from "@/lib/utils";

import { SearchInput } from "@/components/common/SearchInput";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ noteId?: string; view?: string }>;
}) {
  const params = await searchParams;
  const isAllNotes = params.view === "all";
  const notes = await getNotes(undefined, undefined, isAllNotes);
  const folders = await getFolders();
  const folderTree = buildFolderTree(folders);
  const selectedNoteId = params.noteId;

  const selectedNote = selectedNoteId
    ? notes.find((n) => n.id === selectedNoteId) || null
    : null;

  // Ensure auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // For demo purposes only
  }

  return (
    <div className="flex h-full w-full">
      {/* Note List Column */}
      <div
        className={cn(
          "w-full md:w-80 min-w-0 md:min-w-[20rem] md:max-w-[20rem] border-r border-border flex-col bg-card h-full shrink-0",
          selectedNoteId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b border-border flex items-center gap-2">
          <MobileNav folderTree={folderTree} />
          <h1 className="font-semibold text-lg tracking-tight flex-1">
            {isAllNotes ? "All Notes" : "Inbox"}
          </h1>
        </div>
        <div className="p-2 border-b border-border bg-muted/10">
          <SearchInput />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            folders={folders}
          />
        </div>
        <NoteTypeToolbar />
      </div>

      {/* Editor Column */}
      <div
        className={cn(
          "flex-1 h-full bg-background overflow-hidden relative",
          selectedNoteId ? "flex" : "hidden md:flex"
        )}
      >
        <NoteEditor key={selectedNote?.id} note={selectedNote} />
      </div>
    </div>
  );
}
