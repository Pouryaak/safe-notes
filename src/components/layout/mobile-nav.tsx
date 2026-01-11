"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import { FolderNode } from "@/features/folders/utils";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";

export function MobileNav({ folderTree }: { folderTree: FolderNode[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
        <SidebarContent folderTree={folderTree} />
      </SheetContent>
    </Sheet>
  );
}
