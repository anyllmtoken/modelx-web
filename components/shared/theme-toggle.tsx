"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = ["light", "dark", "system"] as const;

function ThemeIcon({
  mounted,
  resolvedTheme,
}: {
  mounted: boolean;
  resolvedTheme?: string;
}) {
  if (!mounted) return <span className="inline-block size-4" />;
  return resolvedTheme === "light" ? <Sun size={16} /> : <Moon size={16} />;
}

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md transition-colors duration-200"
            title="Theme"
          />
        }
      >
        <ThemeIcon mounted={mounted} resolvedTheme={resolvedTheme} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {THEMES.map((t) => (
          <DropdownMenuItem key={t} onSelect={() => setTheme(t)}>
            <span className="flex-1 text-sm capitalize">{t}</span>
            {mounted && theme === t && (
              <span className="text-foreground text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
