"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePin, signOut } from "@/features/profile/actions";
import { ChevronLeft, Loader2, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Local state used for messaging

// If toast is not available, I'll use local state for success message.
// I will check if toast exists. If not, I'll stick to simple state.

export default function ProfilePage() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPin.length < 4) {
      setMessage({ type: "error", text: "New PIN must be at least 4 digits." });
      setLoading(false);
      return;
    }

    try {
      await updatePin(currentPin, newPin);
      setMessage({ type: "success", text: "Vault PIN updated successfully." });
      setCurrentPin("");
      setNewPin("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update PIN.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">My Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-8">
        {/* Security Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Vault Security</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Update Vault PIN</CardTitle>
              <CardDescription>
                Change the PIN used to access your secure notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePin} className="space-y-4">
                {message && (
                  <Alert
                    variant={
                      message.type === "error" ? "destructive" : "default"
                    }
                    className={
                      message.type === "success"
                        ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300"
                        : ""
                    }
                  >
                    <AlertTitle>
                      {message.type === "success" ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-pin">Current PIN</Label>
                  <Input
                    id="current-pin"
                    type="password"
                    placeholder="Enter current PIN"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    required
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Default PIN is usually 123456 if you haven't changed it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-pin">New PIN</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    placeholder="Enter new PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    required
                    minLength={4}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update PIN
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Account Actions */}
        <section className="space-y-4 pt-8 border-t">
          <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
