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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await unlockVault(pin)) {
      setPin("");
      setError("");
      setShow(false);
    } else {
      setError("Incorrect PIN. Default is '123456'.");
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">Unlock Vault</DialogTitle>
          <DialogDescription className="text-center">
            Enter your PIN to access secure notes.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleUnlock}
          className="space-y-4 pt-2 flex flex-col items-center"
        >
          <div className="space-y-2 flex flex-col items-center">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={(value) => setPin(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
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
