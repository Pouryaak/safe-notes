"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface VaultContextType {
  isVaultLocked: boolean;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  // Default to locked
  const [isVaultLocked, setIsVaultLocked] = useState(true);

  // Auto-lock on inactivity could be added here

  const unlockVault = (pin: string) => {
    // In a real app, verify PIN with server or hash
    // For now, hardcoded "123456" for testing
    if (pin === "123456") {
      setIsVaultLocked(false);
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultLocked(true);
  };

  return (
    <VaultContext.Provider value={{ isVaultLocked, unlockVault, lockVault }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
