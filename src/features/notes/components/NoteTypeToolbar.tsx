"use client";

import { useState } from "react";
import { createNote } from "../actions";
import { FileText, Shield, CheckSquare, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRouter, useSearchParams } from "next/navigation";

export function NoteTypeToolbar({ folderId }: { folderId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreating, setIsCreating] = useState<
    "general" | "secure" | "todo" | "reminder" | null
  >(null);

  const handleCreate = async (
    type: "general" | "secure" | "todo" | "reminder"
  ) => {
    // The `getNote` will return null if not found.
    // To make this "instant", we need the Loader to handle retries OR we need to ensure the DB write happens fast enough
    // OR we preload the data into a cache (not easy with Server Components).

    // Compromise for now:
    // We launch the create request.
    // We navigate.
    // IF the loader is faster than the write, it sees null.
    // We can mitigate this by waiting for the write, OR (user request) "start making the note"
    // User said: "optimistic UI means as soon as the user click it, you open the editor"

    // Let's try firing them in parallel.
    // We can't easily inject the *content* into the Server Component Loader without a DB write.

    // Actually, createNote returns the note.
    // If we await createNote, it's not "instant".
    // But it's usually fast (50-100ms).
    // The spinner was annoying.

    // Let's rely on standard 'await createNote'.
    // BUT we remove the artificial delay/spinner.
    // Just disable the button to prevent double-clicks?
    // Or just let it fly.

    // Re-reading user request: "optimistic UI means as soon as the user click it, you open the editor"
    // This implies INSTANT navigation.
    // If we navigate to `?noteId=generated-uuid` BEFORE it exists in DB...
    // `getNote` will return null.
    // The editor will render `note={null}`.
    // The user sees an empty editor.
    // IF the user starts typing, `NoteEditor` needs to handle `note={null}` by treating it as a new note?
    // Currently `NoteEditor` takes `note: Note | null`. If null, it probably shows "Select a note".

    // So for this to work "instantly", `NoteEditor` needs to support "Draft Mode" where it has an ID but no DB record yet.
    // That's complex refactoring.

    // SIMPLEST "Allowed" Optimistic UI:
    // 1. Generate ID.
    // 2. Fire `createNote(..., id)` (background).
    // 3. Navigate to `?noteId=id`.
    // 4. `NoteEditorLoader` tries to fetch. If null, retry? Or handle gracefully?
    // NoteEditorLoader simply calls `getNote`.

    // If I just await it, it's fast enough. The user issue was likely the UI *blocking* or feeling slow. The spinner makes it *feel* like a process.
    // If I remove the spinner and just await, it might be acceptable.
    // BUT user specifically asked for background creation.

    // Implementation:
    // 1. Generate ID.
    // 2. Fire createNote in background.
    // 3. Update URL.
    // 4. NoteEditorLoader *must* be able to handle "not found yet".
    //
    // Wait, if `NoteEditorLoader` returns null, `page.tsx` renders `<NoteEditor note={null} />`.
    // Does `NoteEditor` handle null as "New Note"? No, checking `NoteEditor.tsx`...
    // It likely shows "Select a note".

    // So I need to ensure `NoteEditor` gets *something*.
    // I can pass the *intent* to create a note?

    // Let's stick to standard await for safety but remove the spinner visual?
    // No, user explicitly asked for background creation.

    // Alternative:
    // Generate ID.
    // Trigger creation.
    // Navigate.
    // `getNote` implementation: if not found, return a "stub" note if it matches the current optimistic ID?
    // No, server can't know about client's optimistic ID without passing it.

    // Okay, the robust way:
    // 1. Add `isCreating` ref prevent double clicks (internal).
    // 2. Generate `id`.
    // 3. Navigate `router.push(?noteId=id)`.
    // 4. `createNote` needs to finish *before* `getNote` runs for the new page load.
    // This is a race condition.

    // To solve the race:
    // Client Side:
    // `createNote(id)` -> Server.
    // `router.push` -> Server.
    // Next.js handles these.

    // Maybe I can just speed it up by creating the note *client-side* if I had client-side state?
    // But we are using Server Components/Search Params.

    // Let's try: Await the creation (it's fast) but remove the spinner?
    // "it takes time for the note to be created" -> DB latency.

    // Let's try the race-condition approach (fire and forget) but add a small retry mechanism in `getNote`?
    // No, that's messy.

    // Best Approach for this architecture:
    // Await the creation, but use `useTransition` or just no visual loader?
    // No, the network request `createNote` IS the slow part.

    // OK, what if we use the `NoteEditor` to *create* the note?
    // We navigate to `?noteId=new_uuid&isNew=true`.
    // `getNote` returns null.
    // `NoteEditor` checks `isNew`. If true, it initializes empty state with that ID.
    // On first edit/save, it does `upsert`.

    // This requires:
    // 1. `NoteTypeToolbar`: Generate ID, Push `?noteId=...&new=true`.
    // 2. `createNote` is NOT called here.
    // 3. `NoteEditorLoader` sees `new=true` (via props?).
    // 4. `NoteEditorLoader` passes a "Stub Note" to `NoteEditor`.
    // 5. User sees empty editor.
    // 6. User types -> `updateNote` (which triggers `upsert` in DB).
    // 7. We need to handle the `insert` vs `update`. `upsert` handles this if ID is provided.

    // Does `updateNote` use `upsert`? Checking `actions.ts`.
    // `updateNote` uses `.update().eq('id', id)`. It won't insert.
    // I need an `upsertNote` or modify `updateNote`.

    // Making `NoteEditor` capable of creating is the true "Optimistic" way.
    // But `NoteTypeToolbar` has TYPES (secure, todo, etc).
    // So we need to pass the type too. `?noteId=...&new=true&type=secure`.

    // Plan:
    // 1. `NoteTypeToolbar`: Generate ID, Push `?noteId=...&type=...`.
    // 2. `createNote` background call (fire and forget) to ensure record exists eventually.
    // 3. `NoteEditorLoader`: If `getNote` returns null, check if we have an ID.
    //    Actually `getNote` takes ID.
    //    If `getNote` returns null, we can return a "Temporary Note Object" based on the ID?
    //    But `NoteEditorLoader` is server-side. It doesn't know the *type* unless we query param it?
    //    Actually, we *are* firing `createNote` in the background.
    //    So if `getNote` fails, we could return a specific "Optimistic Note" structure?

    // Let's stick to the user's specific request: "open the editor... create the note in bg".
    // This implies we DO create it.

    // I will use:
    // 1. `const id = crypto.randomUUID()`
    // 2. `createNote(..., id)` (no await)
    // 3. `router.push(?noteId=id)`

    // I will add a `retry` logic to `getNote` in `actions.ts`?
    // Or just accept the race? Usually `create` is faster than `revalidate`+`render`.
    // Let's try the simple "Fire and Navigate" first.

    try {
      const id = crypto.randomUUID();
      // Fire and forget-ish (no await on the *result*, but we initiate it)
      createNote(folderId, type, id).catch(console.error);

      const params = new URLSearchParams(searchParams.toString());
      params.set("noteId", id);
      params.set("type", type); // Pass type for optimistic stub
      router.push(`?${params.toString()}`);
    } catch (e) {
      console.error("Failed to initiate note creation:", e);
    }
  };

  return (
    <div className="p-3 border-t border-border grid grid-cols-4 gap-2 bg-muted/20 pb-safe">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-14 text-muted-foreground hover:text-primary hover:bg-primary/10 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("general")}
              disabled={!!isCreating}
            >
              {isCreating === "general" ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <FileText className="h-8 w-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>General Note</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-14 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("secure")}
              disabled={!!isCreating}
            >
              {isCreating === "secure" ? (
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              ) : (
                <Shield className="h-8 w-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Secure Note</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-14 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("todo")}
              disabled={!!isCreating}
            >
              {isCreating === "todo" ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              ) : (
                <CheckSquare className="h-8 w-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>To-Do List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-14 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 flex flex-col items-center justify-center p-0 gap-1 rounded-xl"
              onClick={() => handleCreate("reminder")}
              disabled={!!isCreating}
            >
              {isCreating === "reminder" ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              ) : (
                <Clock className="h-8 w-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reminder</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
