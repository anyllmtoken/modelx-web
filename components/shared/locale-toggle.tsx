"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/routing";

export function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "zh" ? "en" : "zh";

  // Always use full locale-prefixed URL so the middleware updates the cookie
  const base = pathname === "/" ? "" : pathname;
  const href = `/${otherLocale}${base}`;

  return (
    <a
      href={href}
      className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md text-xs font-medium transition-colors duration-200"
    >
      {locale === "zh" ? "EN" : "中文"}
    </a>
  );
}
