"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { verifyPin } from "@/features/profile/actions";

interface VaultContextType {
  isVaultLocked: boolean;
  unlockVault: (pin: string) => Promise<boolean>;
  lockVault: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isVaultLocked, setIsVaultLocked] = useState(true);

  // Auto-lock could be added here

  const unlockVault = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setIsVaultLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Vault unlock failed:", error);
      return false;
    }
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
