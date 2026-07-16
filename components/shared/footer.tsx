import { REPO_URL } from "@/lib/config";

export async function Footer() {
  return (
    <footer className="border-border/40 border-t">
      <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-8 sm:px-6">
        <div className="flex items-center">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/50 hover:text-muted-foreground text-xs transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
