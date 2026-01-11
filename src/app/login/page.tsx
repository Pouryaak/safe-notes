import Link from "next/link";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center justify-center p-8 bg-background h-screen">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Fortress Notes</h1>

        <label className="text-md" htmlFor="email">
          Email
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <Button formAction={login} className="mb-2">
          Sign In
        </Button>
        <Button formAction={signup} variant="secondary">
          Sign Up
        </Button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
