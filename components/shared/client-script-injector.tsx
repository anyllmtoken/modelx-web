"use client";

import { useEffect, useRef } from "react";

export function ClientScriptInjector({
  id,
  content,
  type,
}: {
  id: string;
  content: string;
  type?: string;
}) {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const script = document.createElement("script");
    script.id = id;
    script.type = type ?? "application/ld+json";
    script.textContent = content;
    document.head.appendChild(script);
  }, [id, content, type]);

  return null;
}
