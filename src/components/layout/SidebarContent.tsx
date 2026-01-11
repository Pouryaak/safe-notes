"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarContentProps {
  folderTree: FolderNode[];
}

export function SidebarContent({ folderTree }: SidebarContentProps) {
  const { isVaultLocked, lockVault } = useVault();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isInboxActive = pathname === "/" && !searchParams.get("view");
  const isAllNotesActive =
    pathname === "/" && searchParams.get("view") === "all";

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
          <Link
            href="/profile"
            className="flex items-center gap-3 group px-2 py-1 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent group-hover:ring-sidebar-ring transition-all">
              <AvatarImage src="" />{" "}
              {/* Add generic user image or user gravatar if available */}
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground group-hover:text-sidebar-foreground">
                My Profile
              </span>
              <span className="text-[10px] text-muted-foreground">
                Manage Account
              </span>
            </div>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <ModeToggle />
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
      </div>

      {/* Vault Status Widget */}
      <div className="p-3">
        <div
          className={cn(
            "rounded-lg text-sm flex flex-col gap-2 transition-colors border",
            isVaultLocked
              ? "bg-orange-50 border-orange-100 text-orange-900 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-200"
              : "bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200",
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
                  <button className="text-[10px] font-bold text-orange-700 hover:underline dark:text-orange-300">
                    Unlock
                  </button>
                </VaultUnlockDialog>
              ) : (
                <button
                  onClick={() => lockVault()}
                  className="text-[10px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
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
                    isVaultLocked
                      ? "text-orange-700 dark:text-orange-200"
                      : "text-emerald-700 dark:text-emerald-200"
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
                  <button className="w-full text-center py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:hover:bg-orange-900/60 dark:text-orange-200 rounded text-xs font-medium transition-colors">
                    Unlock Notes
                  </button>
                </VaultUnlockDialog>
              ) : (
                <button
                  onClick={() => lockVault()}
                  className="w-full text-center py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-200 rounded text-xs font-medium transition-colors"
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
              "flex items-center cursor-pointer rounded-md text-sm transition-colors font-medium",
              isInboxActive
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isCollapsed ? "justify-center py-2" : "px-2 py-1.5"
            )}
            title="Inbox"
          >
            <Inbox
              size={18}
              className={cn(
                isInboxActive
                  ? "text-sidebar-foreground"
                  : "text-muted-foreground",
                !isCollapsed && "mr-2"
              )}
            />
            {!isCollapsed && <span>Inbox</span>}
          </Link>

          <Link
            href="/?view=all"
            className={cn(
              "flex items-center cursor-pointer rounded-md text-sm transition-colors font-medium",
              isAllNotesActive
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isCollapsed ? "justify-center py-2" : "px-2 py-1.5"
            )}
            title="All Notes"
          >
            <Files
              size={18}
              className={cn(
                isAllNotesActive
                  ? "text-sidebar-foreground"
                  : "text-muted-foreground",
                !isCollapsed && "mr-2"
              )}
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
