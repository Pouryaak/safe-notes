"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import { useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // We use the dedicated extension for more control if needed, but StarterKit includes it. Let's force dedicated one or just use StarterKit's. StarterKit's is fine for simple fenced. Wait, I imported CodeBlock. Let's disable StarterKit's codeBlock to avoid conflict.
      }),
      CodeBlock, // Dedicated code block extension
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground/40 before:float-left before:pointer-events-none h-full",
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[calc(100vh-300px)] prose prose-sm dark:prose-invert max-w-none pb-20 text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-blockquote:text-foreground prose-code:text-foreground",
      },
    },
    immediatelyRender: false, // Fix Hydration mismatch
  });

  // Sync content if it changes externally (e.g. switching notes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set content if it's significantly different to avoid cursor jumps?
      // Tiptap handles this well if we check content match.
      // But Tiptap's getHTML() might differ slightly from stored string.
      // It is safer to only setContent on ID change in parent, but here we just react to prop.
      // We will rely on key-remounting in parent for full note switches,
      // but for live updates (e.g. collaborative), we might need this.
      // For now, let's assume parent handles remounting on note ID change.
      // But if we do need to update:
      // editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Actually, standard pattern is: only set content on mount.
  // Parent component `NoteEditor` uses `key={note.id}` which remounts this component.
  // So initial content is enough.

  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto">
      {/* We place toolbar outside or inside? Parent has sticky header. 
            The user wants the toolbar. NoteEditor will place it.
            But EditorToolbar needs `editor` instance.
            So we should render it here, or expose editor via Ref?
            Rendering here is easier.
        */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur">
        <EditorToolbar editor={editor} />
      </div>

      <div className="px-8 py-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
