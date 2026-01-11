"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteFolder } from "@/features/folders/actions";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteFolderDialogProps {
  folderId: string;
  folderName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteFolderDialog({
  folderId,
  folderName,
  trigger,
  open,
  onOpenChange,
}: DeleteFolderDialogProps) {
  const [loading, setLoading] = useState(false);
  // Internal state if controlled externally or uncontrolled
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange! : setInternalOpen;

  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFolder(folderId);
      setShow(false);
      // Redirect to home if we were validating this folder
      // In a real app we might check if we are currently "in" this folder
      router.refresh();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Folder?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{folderName}"
            </span>
            ?
            <br />
            <br />
            <span className="text-destructive font-medium">Warning:</span> This
            action cannot be undone. All notes and subfolders inside this folder
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setShow(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
