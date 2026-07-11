"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/cn";
import { multiSearch } from "@/lib/search";

interface SearchItem {
  type: "model" | "provider" | "page";
  id: string;
  name: string;
  href: string;
  sub?: string;
  icon?: string;
}

function sanitizeSvg(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return "";
  svg.querySelectorAll("script").forEach((el) => el.remove());
  svg.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    }
  });
  return svg.outerHTML;
}

function ItemIcon({ html, size }: { html: string; size: string }) {
  const clean = sanitizeSvg(html);
  if (!clean) return null;
  return (
    <span
      className={cn(
        "text-foreground flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full",
        size,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export function CommandPalette({
  pages,
  providers,
}: {
  pages: SearchItem[];
  providers: SearchItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [modelResults, setModelResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const tc = useTranslations("Common");
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const open = useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      setQuery("");
      setModelResults([]);
    }, 200);
  }, []);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (mounted) close();
        else open();
      }
      if (e.key === "/" && !mounted) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if ((e.target as HTMLElement)?.isContentEditable) return;
        // Let SearchBar handle "/" on the home page
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search models..."]',
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          return;
        }
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && mounted) {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [mounted, close, open]);

  // Fetch model results from API when query changes
  useEffect(() => {
    if (query.length < 2) {
      setModelResults([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setModelResults(data.models ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const filteredPages = useMemo(
    () => (query ? multiSearch(pages, query, { target: (p) => p.name }) : []),
    [query, pages],
  );

  const filteredProviders = useMemo(
    () =>
      query ? multiSearch(providers, query, { target: (p) => p.name }) : [],
    [query, providers],
  );

  function select(href: string) {
    close();
    setTimeout(() => router.push(href), 200);
  }

  const hasResults =
    filteredPages.length > 0 ||
    filteredProviders.length > 0 ||
    modelResults.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={tc("search")}
        className="text-muted-foreground hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200"
      >
        <Search size={16} />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className={cn(
                "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
                visible ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              onClick={close}
            />
            {/* Dialog */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
              <div
                className={cn(
                  "pointer-events-auto mx-4 w-full max-w-lg transition-all duration-200",
                  visible
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-95 opacity-0",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={tc("search")}
                    value={query}
                    onValueChange={setQuery}
                    autoFocus
                  />
                  <CommandList>
                    {query.length > 0 && !hasResults && !loading && (
                      <CommandEmpty>{tc("noResults")}</CommandEmpty>
                    )}

                    {!query && (
                      <>
                        <CommandGroup heading={tc("pages")}>
                          {pages.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.name}
                              onSelect={() => select(item.href)}
                            >
                              {item.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading={tc("providers")}>
                          {providers.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.name}
                              onSelect={() => select(item.href)}
                            >
                              {item.icon && (
                                <ItemIcon html={item.icon} size="h-4 w-4" />
                              )}
                              {item.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}

                    {filteredPages.length > 0 && (
                      <CommandGroup heading={tc("pages")}>
                        {filteredPages.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => select(item.href)}
                          >
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {filteredProviders.length > 0 && (
                      <CommandGroup heading={tc("providers")}>
                        {filteredProviders.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => select(item.href)}
                          >
                            {item.icon && (
                              <ItemIcon html={item.icon} size="h-4 w-4" />
                            )}
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {modelResults.length > 0 && (
                      <CommandGroup heading={tc("models")}>
                        {modelResults.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => select(item.href)}
                          >
                            {item.icon && (
                              <ItemIcon html={item.icon} size="h-3.5 w-3.5" />
                            )}
                            <span className="min-w-0 flex-1 truncate">
                              {item.name}
                            </span>
                            <span className="text-muted-foreground shrink-0 font-mono text-xs">
                              {item.sub}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
