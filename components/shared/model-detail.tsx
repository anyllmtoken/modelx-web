import { Info } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { PERF_LABELS, REASONING_LABELS, SPEED_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export function InheritedBadge({ from }: { from?: string }) {
  const t = useTranslations("Model");
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="text-muted-foreground/40 hover:text-muted-foreground inline-flex shrink-0 cursor-help transition-colors">
          <Info size={12} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {t("inheritedFrom", { from: from ?? t("officialModelData") })}
      </TooltipContent>
    </Tooltip>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  inheritedFrom,
}: {
  label: string;
  value: string;
  sub?: string;
  inheritedFrom?: string;
}) {
  return (
    <div className="bg-card border-border/40 hover:border-border rounded-lg border px-4 py-3.5 transition-colors">
      <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        {label}
        {inheritedFrom && <InheritedBadge from={inheritedFrom} />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-foreground font-mono text-lg font-semibold tracking-tight">
          {value}
        </span>
        {sub && <span className="text-muted-foreground/60 text-xs">{sub}</span>}
      </div>
    </div>
  );
}

const RATING_LABEL_MAP: Record<string, string[]> = {
  Speed: SPEED_LABELS,
  Reasoning: REASONING_LABELS,
};

export function RatingCard({
  label,
  value,
  max,
  inheritedFrom,
}: {
  label: string;
  value?: number | null;
  max: number;
  inheritedFrom?: string;
}) {
  const labels = RATING_LABEL_MAP[label] ?? PERF_LABELS;
  const description =
    value != null ? (labels[value] ?? `${value}/${max}`) : "—";

  return (
    <div className="bg-card border-border/40 hover:border-border rounded-lg border px-4 py-3.5 transition-colors">
      <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        {label}
        {inheritedFrom && <InheritedBadge from={inheritedFrom} />}
      </div>
      {value != null ? (
        <Tooltip>
          <TooltipTrigger>
            <div className="mt-2 flex h-7 items-center gap-1.5">
              {Array.from({ length: max }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    i < value
                      ? "bg-primary shadow-[0_0_6px_var(--primary)]"
                      : "bg-border/60",
                  )}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      ) : (
        <div className="text-foreground mt-1 font-mono text-lg font-semibold">
          —
        </div>
      )}
    </div>
  );
}

export function DetailCell({
  label,
  value,
  href,
  icon,
  inheritedFrom,
  dateTime,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
  inheritedFrom?: string;
  /** Pass an ISO date string to render a semantic <time> element. */
  dateTime?: string;
}) {
  const valueContent = dateTime ? (
    <time dateTime={dateTime}>{value}</time>
  ) : (
    value
  );
  return (
    <div className="bg-card border-border/40 hover:border-border flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className="flex items-center gap-1.5">
        {href ? (
          <Link
            href={href}
            className={cn(
              "text-foreground flex items-center gap-1.5 text-sm",
              href && "hover:text-primary transition-colors duration-200",
            )}
          >
            {icon}
            {valueContent}
          </Link>
        ) : (
          <span
            className={cn(
              "text-foreground flex items-center gap-1.5 text-sm",
            )}
          >
            {icon}
            {valueContent}
          </span>
        )}
        {inheritedFrom && <InheritedBadge from={inheritedFrom} />}
      </span>
    </div>
  );
}

export function PriceCell({
  label,
  value,
  currency,
}: {
  label: string;
  value?: number | null;
  currency?: string;
}) {
  return (
    <div className="bg-card border-border/40 rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 font-mono font-semibold">
        {formatPrice(value, currency)}
      </div>
    </div>
  );
}
