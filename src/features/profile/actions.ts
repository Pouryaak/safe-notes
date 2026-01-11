"use server";

import { createClient } from "@/lib/supabase/server";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function verifyPin(pin: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("vault_pin_hash")
    .eq("id", user.id)
    .single();

  if (!profile?.vault_pin_hash) {
    // If no PIN set, fallback to default "123456" for backward compatibility/initial setup
    // Ideally we force setup, but let's allow "123456" if null as a transition
    // Actually, better: if no hash, standard pin "123456" is valid?
    // Let's stick to the current logic: Default is '123456'
    return pin === "123456";
  }

  return compare(pin, profile.vault_pin_hash);
}

export async function updatePin(oldPin: string, newPin: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Verify old PIN
  const isValid = await verifyPin(oldPin);
  if (!isValid) {
    throw new Error("Incorrect current PIN");
  }

  // 2. Hash new PIN
  const hashedPin = await hash(newPin, 10);

  // 3. Update DB
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    vault_pin_hash: hashedPin,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
}

import { redirect } from "next/navigation";

// ... existing imports ...

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}
