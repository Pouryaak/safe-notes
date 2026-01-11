"use server";

import { createClient } from "@/lib/supabase/server";
import { Note } from "@/types/database";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";

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
    content:
      note.type === "secure" ? decrypt(note.content || "") : note.content,
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
      content: type === "secure" ? encrypt("") : "",
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

  // Return decrypted/clean content so the UI doesn't see ciphertext
  if (data.type === "secure") {
    return { ...data, content: "" };
  }

  return data;
}

export async function updateNote(id: string, updates: Partial<Note>) {
  const supabase = await createClient();

  // If updating content, we might need to encrypt it if the note is secure
  let processedUpdates = { ...updates };

  if (updates.content !== undefined) {
    // We need to know if this note is secure.
    // Optimization: Pass type in updates or fetch it. Fetches are safer.
    const { data: currentNote } = await supabase
      .from("notes")
      .select("type")
      .eq("id", id)
      .single();

    if (currentNote?.type === "secure" && updates.content) {
      processedUpdates.content = encrypt(updates.content);
    }
  }

  const { error } = await supabase
    .from("notes")
    .update({
      ...processedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
