import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProviderIcon } from "@/components/shared/provider-icon";
import type { ProviderWithModels } from "@/lib/data";

export function ProviderGrid({
  providers,
  total,
  modelsLabel,
  viewAllLabel,
  providersTotalLabel,
}: {
  providers: ProviderWithModels[];
  total: number;
  modelsLabel?: string;
  viewAllLabel?: string;
  providersTotalLabel?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {providers.map((p) => (
        <Link
          key={p.id}
          href={`/${p.id}`}
          className="group bg-card text-card-foreground ring-foreground/10 hover:ring-primary/20 rounded-2xl p-7 no-underline ring-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
        >
          <div className="mb-3.5 flex justify-center">
            <ProviderIcon provider={p} size={40} />
          </div>
          <h3 className="mb-1.5 text-center text-base font-semibold">
            {p.name}
          </h3>
          <p className="text-muted-foreground text-center text-[13px] leading-relaxed">
            {p.models.length} {modelsLabel ?? "models"} · {p.region}
          </p>
        </Link>
      ))}
      <Link
        href="/providers"
        className="group bg-card text-card-foreground ring-foreground/10 hover:ring-primary/20 flex flex-col items-center justify-center rounded-2xl p-7 no-underline ring-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      >
        <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
          <ChevronRight
            size={20}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </div>
        <h3 className="text-muted-foreground group-hover:text-foreground mb-1.5 text-center text-base font-semibold transition-colors">
          {viewAllLabel ?? "View all"}
        </h3>
        <p className="text-muted-foreground text-center text-[13px]">
          {total} {providersTotalLabel ?? "providers total"}
        </p>
      </Link>
    </div>
  );
}
