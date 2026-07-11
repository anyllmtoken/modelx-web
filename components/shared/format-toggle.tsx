"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const ACTIVE = "text-foreground";
const INACTIVE =
  "text-muted-foreground transition-colors duration-200 hover:text-foreground";

export function FormatToggle() {
  const tc = useTranslations("Common");
  const [isAI, setIsAI] = useState(false);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const showHuman = useCallback(() => {
    setIsAI(false);
    timeoutRef.current = setTimeout(() => setVisible(false), 200);
  }, []);

  const toggleFormat = useCallback(async () => {
    if (isAI) {
      showHuman();
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const url = new URL(window.location.href);
    url.searchParams.set("format", "md");
    const res = await fetch(url.toString(), {
      headers: { Accept: "text/markdown" },
    });
    const contentType = res.headers.get("content-type") ?? "";
    if (
      !contentType.includes("markdown") &&
      !contentType.includes("text/plain")
    ) {
      return;
    }
    setContent(await res.text());
    setVisible(true);
    requestAnimationFrame(() => setIsAI(true));
  }, [isAI, showHuman]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAI) showHuman();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isAI, showHuman]);

  return (
    <>
      <div className="fixed bottom-20 left-1/2 z-50 hidden -translate-x-1/2 sm:bottom-6 sm:block">
        <button
          onClick={toggleFormat}
          className="bg-muted ring-border flex items-center rounded-md text-xs ring-1 transition-colors duration-200"
        >
          <span className={cn("px-3 py-1.5", isAI ? INACTIVE : ACTIVE)}>
            {tc("human")}
          </span>
          <span className={cn("px-3 py-1.5", isAI ? ACTIVE : INACTIVE)}>
            {tc("ai")}
          </span>
        </button>
      </div>
      {visible && (
        <div
          className={cn(
            "bg-background fixed inset-0 z-40 transition-opacity duration-200",
            isAI ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="mx-auto flex h-12 max-w-3xl items-center px-6 text-sm">
            <span className="text-foreground font-mono">{tc("aiFormat")}</span>
            <div className="mx-auto">
              <span className="text-muted-foreground">
                {tc("markdownDesc")}
              </span>
            </div>
            <button
              onClick={showHuman}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {tc("close")}
            </button>
          </div>
          <div className="via-border h-px bg-gradient-to-r from-transparent to-transparent" />
          <div className="h-[calc(100vh-3rem-1px)] overflow-y-auto">
            <pre className="text-foreground mx-auto max-w-3xl px-6 py-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
