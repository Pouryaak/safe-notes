"use server";

import { createClient } from "@/lib/supabase/server";
import { Note } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function getNotes(
  folderId?: string,
  search?: string
): Promise<Note[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else if (folderId === undefined && !search) {
    // If folderId is explicitly undefined (Inbox) and no search
    // But wait, if logic was: undefined = inbox?
    // The original logic: if (folderId) else (inbox).
    // Users might want "All Notes" search.
    // For now, let's keep Inbox separation unless searching.
    query = query.is("folder_id", null);
  }

  if (search) {
    // If searching, we might want to search across all notes or just current context?
    // User said "search through notes", implies global usually.
    // If folderId is provided, scoped search.
    query = query.ilike("title", `%${search}%`); // Basic search for now
    // Or content? .or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  // Mask secure content
  return data.map((note) => ({
    ...note,
    content: note.type === "secure" ? "Locked" : note.content,
  }));
}

export async function createNote(
  folderId?: string,
  type: "general" | "secure" | "todo" | "reminder" = "general"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: "Untitled Note",
      content: "",
      folder_id: folderId || null,
      user_id: user.id,
      type: type,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(folderId ? `/folders/${folderId}` : "/");
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Optimistic update handling or revalidation needed?
  // We revalidate path where note is visible
  revalidatePath("/");
  // If we knew the folder...
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
