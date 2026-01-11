"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Code,
  SquareCode,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background sticky top-0 z-10 overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap">
      {/* History Group */}
      <div className="flex items-center gap-0.5 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "h-8 px-2 font-bold",
          editor.isActive("heading", { level: 1 }) && "bg-muted text-foreground"
        )}
        title="Heading 1"
      >
        H1
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "h-8 px-2 font-bold",
          editor.isActive("heading", { level: 2 }) && "bg-muted text-foreground"
        )}
        title="Heading 2"
      >
        H2
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "h-8 px-2 font-bold",
          editor.isActive("heading", { level: 3 }) && "bg-muted text-foreground"
        )}
        title="Heading 3"
      >
        H3
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("bulletList") && "bg-muted text-foreground"
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("orderedList") && "bg-muted text-foreground"
        )}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("taskList") && "bg-muted text-foreground"
        )}
        title="Task List"
      >
        <CheckSquare className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("code") && "bg-muted text-foreground"
        )}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("codeBlock") && "bg-muted text-foreground"
        )}
        title="Code Block"
      >
        <SquareCode className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Formatting */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("bold") && "bg-muted text-foreground"
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("italic") && "bg-muted text-foreground"
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("strike") && "bg-muted text-foreground"
        )}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground",
          editor.isActive("blockquote") && "bg-muted text-foreground"
        )}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  );
}
