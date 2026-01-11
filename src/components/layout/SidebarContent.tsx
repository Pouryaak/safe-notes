"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderTree } from "./FolderTree";
import { FolderNode } from "@/features/folders/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Lock,
  Unlock,
  Search,
  Inbox,
  Files,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { CreateFolderDialog } from "@/features/folders/components/CreateFolderDialog";
import { cn } from "@/lib/utils";
import { useVault } from "@/context/VaultContext";
import { VaultUnlockDialog } from "@/components/features/vault/VaultUnlockDialog";

interface SidebarContentProps {
  folderTree: FolderNode[];
}

export function SidebarContent({ folderTree }: SidebarContentProps) {
  const { isVaultLocked, lockVault } = useVault();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border h-full flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle - Absolute Positioned or part of header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-6 z-50 bg-background border border-border rounded-full p-1 text-muted-foreground shadow-sm hover:text-foreground hidden group-hover:block"
          // Always show when collapsed or when hovering sidebar?
          // Better: Put it inside the header for stability
        )}
      >
        {/* Actually, let's put it IN structure, easier for 'up there' */}
      </button>

      {/* Header */}
      <div
        className={cn(
          "p-4 border-b border-sidebar-border flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-primary rounded-md" />
            <h1 className="font-bold text-sidebar-foreground text-lg tracking-tight">
              Fortress
            </h1>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Vault Status Widget */}
      <div className="p-3">
        <div
          className={cn(
            "rounded-lg text-sm flex flex-col gap-2 transition-colors border",
            isVaultLocked
              ? "bg-orange-50 border-orange-100 text-orange-900"
              : "bg-emerald-50 border-emerald-100 text-emerald-900",
            isCollapsed ? "p-2 items-center" : "p-3"
          )}
        >
          {isCollapsed ? (
            // Mini Widget
            <div className="flex flex-col items-center gap-2">
              {isVaultLocked ? (
                <Lock size={16} className="text-orange-500" />
              ) : (
                <Unlock size={16} className="text-emerald-500" />
              )}
              {isVaultLocked ? (
                <VaultUnlockDialog>
                  <button className="text-[10px] font-bold text-orange-700 hover:underline">
                    Unlock
                  </button>
                </VaultUnlockDialog>
              ) : (
                <button
                  onClick={() => lockVault()}
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  Lock
                </button>
              )}
            </div>
          ) : (
            // Full Widget
            <>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-medium",
                    isVaultLocked ? "text-orange-700" : "text-emerald-700"
                  )}
                >
                  {isVaultLocked ? "Vault Locked" : "Vault Unlocked"}
                </span>
                {isVaultLocked ? (
                  <Lock size={14} className="text-orange-500" />
                ) : (
                  <Unlock size={14} className="text-emerald-500" />
                )}
              </div>

              {isVaultLocked ? (
                <VaultUnlockDialog>
                  <button
                    className="w-full text-center py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs font-medium transition-colors"
                    onClick={(e) => {
                      // Optional
                    }}
                  >
                    Unlock Notes
                  </button>
                </VaultUnlockDialog>
              ) : (
                <button
                  onClick={() => lockVault()}
                  className="w-full text-center py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-xs font-medium transition-colors"
                >
                  Lock Now
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 mb-4">
          <Link
            href="/"
            className={cn(
              "flex items-center cursor-pointer rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors font-medium",
              isCollapsed ? "justify-center py-2" : "px-2 py-1.5"
            )}
            title="Inbox"
          >
            <Inbox
              size={18}
              className={cn("text-muted-foreground", !isCollapsed && "mr-2")}
            />
            {!isCollapsed && <span>Inbox</span>}
          </Link>

          <Link
            href="/?view=all"
            className={cn(
              "flex items-center cursor-pointer rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors font-medium",
              isCollapsed ? "justify-center py-2" : "px-2 py-1.5"
            )}
            title="All Notes"
          >
            <Files
              size={18}
              className={cn("text-muted-foreground", !isCollapsed && "mr-2")}
            />
            {!isCollapsed && <span>All Notes</span>}
          </Link>
        </div>

        {!isCollapsed && (
          <>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Folders
            </div>
            <FolderTree nodes={folderTree} />
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30">
          <CreateFolderDialog />
        </div>
      )}
    </div>
  );
}
