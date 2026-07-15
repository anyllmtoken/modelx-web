import { Menu } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CommandPalette } from "@/components/shared/command-palette";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { Logo } from "@/components/shared/logo";
import { NavLinks } from "@/components/shared/nav-links";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  commandPaletteData: {
    providers: {
      type: "provider";
      id: string;
      name: string;
      href: string;
      sub: string;
      icon?: string;
    }[];
  };
}

export async function Header({ commandPaletteData }: HeaderProps) {
  const t = await getTranslations("Nav");

  const NAV_LINKS = [
    { href: "/models", label: t("models") },
    { href: "/providers", label: t("providers") },
    { href: "/compare", label: t("compare") },
    { href: "/analytics", label: t("analytics") },
  ] as const;

  return (
    <header className="bg-background/95 border-border sticky top-0 z-50 border-b backdrop-blur-xs">
      <nav className="mx-auto flex h-15 max-w-[1200px] items-center justify-between px-6 text-sm">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 text-xl font-bold no-underline"
          >
            <Logo className="h-5 w-5" />
            ModelX
          </Link>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="md:hidden"
                  aria-label={t("menu")}
                />
              }
            >
              <Menu size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<a href={link.href} />}
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop nav */}
          <NavLinks links={NAV_LINKS} />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          <CommandPalette
            pages={NAV_LINKS.map((link) => ({
              type: "page" as const,
              id: `p-${link.href.replace(/\//g, "").replace(/[^a-z]/g, "")}`,
              name: link.label,
              href: link.href,
            }))}
            providers={commandPaletteData.providers}
          />
          <LocaleToggle />
        </div>
      </nav>
    </header>
  );
}
