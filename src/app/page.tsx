import { getNotes, createNote } from "@/features/notes/actions";
import { getFolders } from "@/features/folders/actions";
import { NoteList } from "@/features/notes/components/NoteList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NoteTypeToolbar } from "@/features/notes/components/NoteTypeToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ noteId?: string; view?: string }>;
}) {
  const params = await searchParams;
  const isAllNotes = params.view === "all";
  const notes = await getNotes(undefined, undefined, isAllNotes);
  const folders = await getFolders();
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
    // For demo purposes only; in real app, Middleware handles redirects
  }

  return (
    <div className="flex h-full w-full">
      {/* Note List Column */}
      <div className="w-80 min-w-[20rem] max-w-[20rem] border-r border-border flex flex-col bg-card h-full shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-semibold text-lg tracking-tight">
            {isAllNotes ? "All Notes" : "Inbox"}
          </h1>
        </div>
        <div className="p-2 border-b border-border bg-muted/10">
          <SearchInput />
        </div>
        <ScrollArea className="flex-1">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            folders={folders}
          />
        </ScrollArea>
        <NoteTypeToolbar />
      </div>

      {/* Editor Column */}
      <div className="flex-1 h-full bg-background overflow-hidden relative">
        <NoteEditor key={selectedNote?.id} note={selectedNote} />
      </div>
    </div>
  );
}
