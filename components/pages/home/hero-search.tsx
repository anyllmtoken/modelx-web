"use client";

import { Search, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { cn } from "@/lib/cn";

interface Suggestion {
  type: "model" | "provider";
  id: string;
  name: string;
  href: string;
  sub: string;
  icon?: string;
}

export function HeroSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  const showDropdown = focused && query.trim().length >= 2;

  // Fetch suggestions from API
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setActiveIndex(-1);

    fetch(`/api/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data.models ?? []);
        setLoading(false);
      })
      .catch(() => {
        /* aborted — ignore */
      });

    return () => controller.abort();
  }, [query]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;

      // If a suggestion is highlighted via keyboard, navigate to it
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        router.push(suggestions[activeIndex].href);
        inputRef.current?.blur();
        return;
      }

      router.push(`/models?q=${encodeURIComponent(q)}`);
      inputRef.current?.blur();
    },
    [query, activeIndex, suggestions, router],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
  }

  function navigateTo(href: string) {
    router.push(href);
    inputRef.current?.blur();
  }

  return (
    <div className="relative mx-auto max-w-[620px]">
      <form onSubmit={handleSubmit} role="search">
        <div className="flex rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="搜索模型名称或厂商…"
            className="placeholder:text-muted-foreground text-foreground focus-visible:border-primary h-[50px] flex-1 rounded-l-xl rounded-r-none border-2 border-r-0 bg-transparent px-5 text-[15px] outline-none"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="hero-search-results"
            aria-activedescendant={
              activeIndex >= 0 ? `hero-sug-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex h-[50px] shrink-0 cursor-pointer items-center gap-1.5 rounded-r-xl bg-[#2563EB] px-7 text-[15px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            搜索
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div
          id="hero-search-results"
          role="listbox"
          className={cn(
            "ring-border absolute top-full right-0 left-0 z-50 mt-2 origin-top overflow-hidden rounded-xl bg-white shadow-lg ring-1 transition-all duration-150",
            suggestions.length > 0
              ? "scale-y-100 opacity-100"
              : "pointer-events-none scale-y-95 opacity-0",
          )}
        >
          {suggestions.length > 0 ? (
            <>
              <div className="py-1">
                {suggestions.map((item, i) => (
                  <button
                    key={item.id}
                    id={`hero-sug-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigateTo(item.href);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                      i === activeIndex ? "bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <ProviderIcon
                      provider={item.icon ? { icon: item.icon } : null}
                      size={16}
                    />
                    <span className="text-foreground truncate font-medium">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                      {item.sub}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground/40 shrink-0"
                    />
                  </button>
                ))}
              </div>
              <div className="border-border text-muted-foreground border-t px-4 py-2 text-xs">
                Enter 搜索全部 · 方向键 选择快捷跳转
              </div>
            </>
          ) : (
            !loading && (
              <div className="text-muted-foreground px-4 py-6 text-center text-sm">
                未找到匹配结果
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
