"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();

  return (
    <ul className="hidden list-none items-center gap-8 md:flex">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/" || pathname === "/en"
            : pathname.startsWith(link.href);

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "border-b-2 pb-1 text-sm font-medium no-underline transition-colors",
                isActive
                  ? "text-primary border-primary"
                  : "text-muted-foreground hover:text-primary border-transparent",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
