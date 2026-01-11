import { getNote } from "../actions";
import { NoteEditor } from "./NoteEditor";
import { Note } from "@/types/database";

export async function NoteEditorLoader({ noteId }: { noteId: string }) {
  const note = await getNote(noteId);

  // We explicitly reset the editor when ID changes by using `key`
  return <NoteEditor key={noteId} note={note} />;
}
