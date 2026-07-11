"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useMemo, useRef, useState } from "react";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { cn } from "@/lib/cn";
import { multiSearch } from "@/lib/search";

interface SearchItem {
  id: string;
  name: string;
  href: string;
  sub: string;
  icon?: string;
  type: "model" | "provider";
  providerType?: string;
}

export function SearchBar({ items }: { items: SearchItem[] }) {
  const tc = useTranslations("Common");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return multiSearch(items, query, {
      target: (item) => `${item.name} ${item.sub} ${item.id}`,
      bonus: (item) => {
        if (item.type === "provider") return 10;
        if (item.providerType === "direct") return 5;
        if (item.providerType === "cloud") return 2;
        return 0;
      },
      limit: 8,
    });
  }, [items, query]);

  const showDropdown = focused && query.trim().length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/models?q=${encodeURIComponent(q)}`);
      inputRef.current?.blur();
    }
  }

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative mx-auto max-w-[680px]">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="dark:bg-card border-input focus-within:border-primary flex rounded-xl border-2 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="text-muted-foreground/50 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={tc("search")}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-results"
            aria-autocomplete="list"
            autoComplete="off"
            className="placeholder:text-muted-foreground h-[52px] w-full rounded-xl border-0 bg-transparent pr-14 pl-11 text-[15px] outline-none"
          />
          {query && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors"
              onClick={clear}
              aria-label={tc("clear")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          id="search-results"
          role="listbox"
          className={cn(
            "dark:bg-card ring-foreground/10 dark:ring-border absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl bg-white shadow-lg ring-1 transition-all duration-200",
            results.length > 0
              ? "scale-y-100 opacity-100"
              : "pointer-events-none scale-y-95 opacity-0",
          )}
        >
          {results.length > 0 ? (
            <>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="option"
                  className="hover:bg-muted flex items-center gap-3 px-5 py-3 text-sm transition-colors duration-150"
                >
                  <ProviderIcon
                    provider={item.icon ? { icon: item.icon } : null}
                    size={18}
                  />
                  <span className="text-foreground truncate font-medium">
                    {item.name}
                  </span>
                  <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                    {item.sub}
                  </span>
                </Link>
              ))}
              <div className="border-border text-muted-foreground flex items-center gap-1.5 border-t px-5 py-2.5 text-xs">
                <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                  ↵
                </kbd>{" "}
                {tc("pressEnter")}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground px-5 py-5 text-center text-sm">
              {tc("noResults")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
