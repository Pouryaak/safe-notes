"use server";

import { createClient } from "@/lib/supabase/server";
import { Folder } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function getFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching folders:", error);
    return [];
  }

  return data;
}

export async function createFolder(name: string, parentId?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name,
      parent_id: parentId || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  return data;
}

export async function updateFolder(id: string, updates: Partial<Folder>) {
  const supabase = await createClient();
  const { error } = await supabase.from("folders").update(updates).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteFolder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("folders").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
