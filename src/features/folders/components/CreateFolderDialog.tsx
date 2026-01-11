"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createFolder } from "@/features/folders/actions";

interface CreateFolderDialogProps {
  parentId?: string | null;
  trigger?: React.ReactNode;
}

export function CreateFolderDialog({
  parentId = null,
  trigger,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      await createFolder(name, parentId);
      setOpen(false);
      setName("");
    } catch (error) {
      console.error("Failed to create folder", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="w-full flex items-center justify-center gap-2 py-2 border border-sidebar-border rounded-md text-sm text-muted-foreground hover:bg-background hover:shadow-sm transition-all bg-background">
            <Plus size={16} /> New Folder
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <Input
            id="name"
            placeholder="Folder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
