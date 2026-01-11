"use server";

import { createClient } from "@/lib/supabase/server";
import { Note } from "@/types/database";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";

export async function getNotes(
  folderId?: string,
  search?: string,
  includeAll: boolean = false
): Promise<Note[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else if (!includeAll && !search) {
    // If not including all and no search, show Inbox (orphans)
    query = query.is("folder_id", null);
  }
  // If includeAll is true, we don't apply any folder filter (unless folderId was passed, which overrides).
  // search also applies globally if includeAll is true or folderId is missing.

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  // Decrypt content for secure notes
  return data.map((note) => ({
    ...note,
    content:
      note.type === "secure" ? decrypt(note.content || "") : note.content,
  }));
}

export async function duplicateNote(noteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch original
  const { data: original, error: fetchError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .single();

  if (fetchError || !original) throw new Error("Note not found");

  // Create copy
  const { error: insertError } = await supabase.from("notes").insert({
    title: `${original.title} (Copy)`,
    content: original.content, // Copy ciphertext directly or plain text
    type: original.type,
    user_id: user.id,
    folder_id: original.folder_id,
  });

  if (insertError) throw new Error(insertError.message);
  revalidatePath("/");
}

export async function moveNote(noteId: string, targetFolderId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ folder_id: targetFolderId, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
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
