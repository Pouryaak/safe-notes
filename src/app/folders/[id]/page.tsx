import { getNotes } from "@/features/notes/actions";
import { NoteList } from "@/features/notes/components/NoteList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NoteTypeToolbar } from "@/features/notes/components/NoteTypeToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "@/components/common/SearchInput";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

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
      <div className="w-80 border-r border-border flex flex-col bg-card h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-semibold text-lg truncate pr-2 text-foreground">
            {folder.name}
          </h1>
        </div>
        <div className="p-2 border-b border-border bg-muted/10">
          <SearchInput />
        </div>
        <ScrollArea className="flex-1">
          <NoteList notes={notes} selectedNoteId={noteId} />
        </ScrollArea>
        <NoteTypeToolbar folderId={folder.id} />
      </div>

      {/* Editor Column */}
      <div className="flex-1 h-full bg-background overflow-hidden relative">
        <NoteEditor key={selectedNote?.id} note={selectedNote} />
      </div>
    </div>
  );
}
