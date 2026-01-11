"use client";

import React, { useState } from "react";
import { Folder } from "@/types/database";
import { FolderNode } from "@/features/folders/utils";
import { CreateFolderDialog } from "@/features/folders/components/CreateFolderDialog";
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DeleteFolderDialog } from "@/features/folders/components/DeleteFolderDialog";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { updateFolder } from "@/features/folders/actions";
import { useRouter, useParams } from "next/navigation";

interface FolderTreeProps {
  nodes: FolderNode[];
  level?: number;
}

function DraggableFolderItem({
  node,
  level,
  onToggle,
  isOpen,
  isActive,
}: {
  node: FolderNode;
  level: number;
  onToggle: (id: string) => void;
  isOpen: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: node.id,
      data: node,
    });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: node,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setDroppableRef}
      className={cn(
        "group rounded-md",
        isOver && "bg-sidebar-accent/50",
        isDragging && "opacity-50"
      )}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "flex items-center py-1.5 px-2 hover:bg-sidebar-accent cursor-pointer text-sm mb-0.5 rounded-md transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-foreground",
          level > 0 && "ml-4" // Indentation
        )}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/folders/${node.id}`);
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className="p-0.5 rounded-sm hover:bg-sidebar-accent/80 mr-1 text-muted-foreground"
        >
          {node.children.length > 0 ? (
            isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="w-3.5 h-3.5 block" />
          )}
        </div>

        <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground/70" />
        <span className="flex-1 truncate">{node.name}</span>

        {/* Actions Menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          {/* Inline Create Subfolder */}
          <CreateFolderDialog
            parentId={node.id}
            trigger={
              <button className="p-1 hover:bg-sidebar-accent-foreground/10 rounded text-muted-foreground hover:text-sidebar-foreground">
                <Plus size={14} />
              </button>
            }
          />

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-sidebar-accent-foreground/10 rounded text-muted-foreground hover:text-sidebar-foreground">
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-48">
              <DropdownMenuItem disabled>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteFolderDialog
                folderId={node.id}
                folderName={node.name}
                trigger={
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()} // Prevent closing dropdown immediately, handled by dialog
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Rewriting to separate Item from Tree logic better
// We need a map of open folders
export function FolderTree({ nodes }: { nodes: FolderNode[] }) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const params = useParams();
  const currentFolderId = params?.id as string | undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleToggle = (id: string) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Move active folder into over folder
      // console.log(`Moving ${active.id} into ${over.id}`)
      try {
        await updateFolder(active.id as string, {
          parent_id: over.id as string,
        });
      } catch (e) {
        console.error("Failed to move folder", e);
      }
    }
  };

  const renderNode = (node: FolderNode, level: number = 0) => {
    const isOpen = openFolders[node.id] || false;
    const isActive = node.id === currentFolderId;
    return (
      <div key={node.id}>
        <DraggableFolderItem
          node={node}
          level={level}
          isOpen={isOpen}
          isActive={isActive}
          onToggle={handleToggle}
        />
        {isOpen && node.children.length > 0 && (
          <div className="ml-0">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-1">
        {nodes.map((node) => renderNode(node))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-background border p-2 rounded shadow-md flex items-center">
            <FolderIcon className="h-4 w-4 mr-2" />
            Item
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
