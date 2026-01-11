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
import { useVault } from "@/context/VaultContext";
import { Lock, Unlock } from "lucide-react";

interface VaultUnlockDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VaultUnlockDialog({
  children,
  open,
  onOpenChange,
}: VaultUnlockDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { unlockVault } = useVault();

  // Internal state management for when used as a trigger
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange! : setInternalOpen;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockVault(pin)) {
      setPin("");
      setError("");
      setShow(false);
    } else {
      setError("Incorrect PIN. Default is '1234'.");
      setPin("");
    }
  };

  return (
    <Dialog
      open={show}
      onOpenChange={(val) => {
        setShow(val);
        if (!val) {
          setPin("");
          setError("");
        }
      }}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">Unlock Vault</DialogTitle>
          <DialogDescription className="text-center">
            Enter your PIN to access secure notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center tracking-[0.5em] font-mono text-lg"
              autoFocus
              maxLength={4}
            />
            {error && (
              <p className="text-xs text-destructive text-center font-medium">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Unlock
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
