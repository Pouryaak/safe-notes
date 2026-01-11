"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchInput({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }

    // Only navigate if the search param actually changed
    const currentSearch = searchParams.get("search") || "";
    if (currentSearch !== debouncedValue) {
      router.replace(`?${params.toString()}`);
    }
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="w-full pl-9 bg-muted/50 border-none focus-visible:ring-1"
        placeholder={placeholder || "Search notes..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
