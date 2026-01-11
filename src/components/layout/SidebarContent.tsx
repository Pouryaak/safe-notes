"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderTree } from "./FolderTree";
import { FolderNode } from "@/features/folders/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Unlock, Search } from "lucide-react";
import { CreateFolderDialog } from "@/features/folders/components/CreateFolderDialog";
import { cn } from "@/lib/utils";
import { useVault } from "@/context/VaultContext";
import { VaultUnlockDialog } from "@/components/features/vault/VaultUnlockDialog";

interface SidebarContentProps {
  folderTree: FolderNode[];
}

export function SidebarContent({ folderTree }: SidebarContentProps) {
  const { isVaultLocked, lockVault } = useVault();

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center justify-between mb-4 group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md" />
            <h1 className="font-bold text-sidebar-foreground text-lg tracking-tight">
              Fortress
            </h1>
          </div>
          <div className="text-xs px-2 py-0.5 bg-sidebar-accent rounded-full text-muted-foreground group-hover:bg-sidebar-accent/80 transition-colors">
            v2.0
          </div>
        </Link>

        {/* Vault Status Widget */}
        <div
          className={cn(
            "rounded-lg p-3 text-sm flex flex-col gap-2 transition-colors border",
            isVaultLocked
              ? "bg-orange-50 border-orange-100 text-orange-900"
              : "bg-emerald-50 border-emerald-100 text-emerald-900"
          )}
        >
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
                  // Optional: e.preventDefault() if nested in link, but here it is fine.
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
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5 mb-4">
          <Link
            href="/"
            className="flex items-center px-2 py-1.5 cursor-pointer rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors font-medium"
          >
            <Search size={16} className="mr-2 text-muted-foreground" />
            <span>All Notes</span>
          </Link>
        </div>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Folders
        </div>
        <FolderTree nodes={folderTree} />
      </ScrollArea>

      {/* Footer */}
      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30">
        <CreateFolderDialog />
      </div>
    </div>
  );
}
