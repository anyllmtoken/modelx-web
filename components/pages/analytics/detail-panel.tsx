"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, Calendar, DollarSign, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsModel, Selection } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatTokens, regionFlag } from "@/lib/format";

const PERF_LABELS = ["", "Basic", "Moderate", "Strong", "Advanced", "Frontier"];
const PERF_COLORS: Record<number, string> = {
  1: "bg-red-500/10 text-red-600 dark:text-red-400",
  2: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  3: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  4: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  5: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const CAP_DISPLAY: Record<string, string> = {
  vision: "Vision",
  tool_call: "Tools",
  reasoning: "Reasoning",
  streaming: "Streaming",
  structured_output: "JSON",
  fine_tuning: "Fine-tune",
};

const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Free: { min: 0, max: 0 },
  "<$0.5": { min: 0.001, max: 0.5 },
  "$0.5–2": { min: 0.5, max: 2 },
  "$2–5": { min: 2, max: 5 },
  "$5–15": { min: 5, max: 15 },
  "$15–30": { min: 15, max: 30 },
  "$30+": { min: 30, max: Infinity },
};

const CTX_RANGES: Record<string, { min: number; max: number }> = {
  "<8K": { min: 0, max: 8_000 },
  "8-32K": { min: 8_000, max: 32_000 },
  "32-128K": { min: 32_000, max: 128_000 },
  "128-512K": { min: 128_000, max: 512_000 },
  "512K-1M": { min: 512_000, max: 1_000_000 },
  "1M+": { min: 1_000_000, max: Number.POSITIVE_INFINITY },
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CN: "China",
  CA: "Canada",
  FR: "France",
  GB: "United Kingdom",
};

const OPEN_LICENSES = new Set([
  "apache-2.0",
  "mit",
  "llama-community",
  "gemma",
  "qwen",
  "deepseek",
  "open-weight",
  "cc-by-4.0",
  "cc-by-sa-4.0",
]);

export function DetailPanel({
  selection,
  models,
  onClose,
}: {
  selection: Selection;
  models: AnalyticsModel[];
  onClose: () => void;
}) {
  const ta = useTranslations("Analytics");
  const tc = useTranslations("Common");
  const tm = useTranslations("Model");
  const content = renderContent(selection, models, ta, tc, tm);
  if (!content) return null;

  return (
    <div className="bg-background ring-border relative overflow-hidden rounded-md shadow-lg ring-1">
      <button
        type="button"
        onClick={onClose}
        className="bg-background/80 text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5 z-10 rounded p-1 backdrop-blur-sm transition-colors"
      >
        <X size={12} />
      </button>
      {content}
    </div>
  );
}

function renderContent(
  selection: Selection,
  models: AnalyticsModel[],
  ta: (k: string) => string,
  tc: (k: string) => string,
  tm: (k: string) => string,
) {
  if (selection.type === "model") {
    return renderModel(selection, models, ta, tc, tm);
  }
  // All other types: filter models, group by provider, render
  const { filtered, header } = resolveSelection(selection, models);
  const grouped = groupByProvider(filtered);
  const totalProviders = grouped.length;

  return (
    <>
      {/* Header */}
      <div className="border-border border-b px-3 py-3 pr-8">
        <div className="text-foreground text-sm font-medium">
          {header.title}
        </div>
        {header.badges && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {header.badges.map((b) => (
              <Badge key={b.text} className={b.className}>
                {b.text}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="border-border flex border-b">
        <div className="flex-1 px-3 py-2">
          <div className="text-foreground font-mono text-sm">
            {filtered.length}
          </div>
          <div className="text-muted-foreground text-[10px]">
            {tm("models")}
          </div>
        </div>
        <div className="border-border flex-1 border-l px-3 py-2">
          <div className="text-foreground font-mono text-sm">
            {totalProviders}
          </div>
          <div className="text-muted-foreground text-[10px]">
            {tc("providers")}
          </div>
        </div>
        {header.stat && (
          <div className="border-border flex-1 border-l px-3 py-2">
            <div className="text-foreground font-mono text-sm">
              {header.stat.value}
            </div>
            <div className="text-muted-foreground text-[10px]">
              {header.stat.label}
            </div>
          </div>
        )}
      </div>

      {/* Grouped list */}
      <div
        className="max-h-[50vh] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {grouped.map((group, gi) => (
          <div key={group.provider}>
            {/* Provider section header */}
            <div
              className={cn(
                "bg-muted/30 sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5",
                gi > 0 && "border-border border-t",
              )}
            >
              <ProviderIcon
                provider={group.icon ? { icon: group.icon } : null}
                size={11}
              />
              <span className="text-muted-foreground flex-1 text-[10px]">
                {group.name}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {group.models.length}
              </span>
            </div>
            {/* Models in this provider */}
            {group.models.slice(0, 8).map((m) => (
              <Link
                key={`${m.provider}/${m.id}-${m.region}`}
                href={`/${m.provider}/${m.id}`}
                className="border-border hover:bg-accent flex items-center gap-2 border-t px-3 py-1.5 transition-colors duration-200"
              >
                <span className="text-foreground min-w-0 flex-1 truncate text-xs">
                  {m.name}
                </span>
                <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                  {formatMeta(m, selection)}
                </span>
              </Link>
            ))}
            {group.models.length > 8 && (
              <div className="border-border text-muted-foreground border-t px-3 py-1 text-[10px]">
                +{group.models.length - 8} {tc("more")}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Model detail (single model card) ── */

function renderModel(
  selection: { type: "model"; id: string },
  models: AnalyticsModel[],
  ta: (k: string) => string,
  tc: (k: string) => string,
  tm: (k: string) => string,
) {
  const m = models.find((m) => m.id === selection.id);
  if (!m) return null;

  return (
    <>
      <div className="border-border border-b px-3 py-3 pr-8">
        <div className="flex items-center gap-2">
          <ProviderIcon
            provider={m.providerIcon ? { icon: m.providerIcon } : null}
            size={16}
          />
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate text-sm font-medium">
              {m.name}
            </div>
            <div className="text-muted-foreground text-[10px]">
              {m.providerName}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {m.performance != null && (
            <Badge className={PERF_COLORS[m.performance]}>
              {PERF_LABELS[m.performance]}
            </Badge>
          )}
          {m.model_type && <Badge>{m.model_type}</Badge>}
          {m.open_weight && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
              open weight
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-border grid grid-cols-2 gap-px">
        {m.input != null && (
          <Stat icon={DollarSign} label="Input" value={`$${m.input}/M`} />
        )}
        {m.output != null && (
          <Stat icon={DollarSign} label="Output" value={`$${m.output}/M`} />
        )}
        {m.context_window != null && (
          <Stat
            icon={Zap}
            label="Context"
            value={formatTokens(m.context_window)}
          />
        )}
        {m.release_date && (
          <Stat icon={Calendar} label="Released" value={m.release_date} />
        )}
      </div>

      {m.caps.length > 0 && (
        <div className="border-border flex flex-wrap gap-1 border-t px-3 py-2.5">
          {m.caps.map((c) => (
            <Badge
              key={c}
              className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            >
              {CAP_DISPLAY[c] ?? c}
            </Badge>
          ))}
        </div>
      )}

      <Link
        href={`/${m.provider}/${m.id}`}
        className="border-border text-muted-foreground hover:bg-accent hover:text-foreground flex items-center justify-center gap-1.5 border-t px-3 py-2.5 text-xs transition-colors duration-200"
      >
        View details <ArrowRight size={12} />
      </Link>
    </>
  );
}

/* ── Selection resolver — returns filtered models + header config ── */

interface HeaderConfig {
  title: string;
  badges?: { text: string; className?: string }[];
  stat?: { label: string; value: string };
}

function resolveSelection(
  selection: Selection,
  models: AnalyticsModel[],
): { filtered: AnalyticsModel[]; header: HeaderConfig } {
  switch (selection.type) {
    case "month": {
      const { month, chart } = selection;
      let filtered = models.filter((m) => m.release_date?.startsWith(month));
      if (chart === "context") {
        filtered = filtered
          .filter((m) => m.context_window)
          .sort((a, b) => (b.context_window ?? 0) - (a.context_window ?? 0));
      }
      const openPct =
        filtered.length > 0
          ? Math.round(
              (filtered.filter((m) => m.open_weight).length / filtered.length) *
                100,
            )
          : 0;
      return {
        filtered,
        header: {
          title: month,
          badges: [
            {
              text:
                chart === "releases"
                  ? "releases"
                  : chart === "context"
                    ? "context"
                    : "open weight",
              className:
                chart === "releases"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : chart === "context"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    : "bg-green-500/10 text-green-600 dark:text-green-400",
            },
          ],
          stat: { label: "open weight", value: `${openPct}%` },
        },
      };
    }
    case "capability": {
      const filtered = models.filter(
        (m) =>
          m.provider === selection.provider && m.caps.includes(selection.cap),
      );
      const total = models.filter(
        (m) => m.provider === selection.provider,
      ).length;
      const pct = total > 0 ? Math.round((filtered.length / total) * 100) : 0;
      return {
        filtered,
        header: {
          title: CAP_DISPLAY[selection.cap] ?? selection.cap,
          badges: [
            {
              text: filtered[0]?.providerName ?? selection.provider,
              className: "bg-muted text-muted-foreground",
            },
          ],
          stat: { label: "coverage", value: `${pct}%` },
        },
      };
    }
    case "price": {
      const range = PRICE_RANGES[selection.label];
      const filtered = range
        ? models.filter((m) => {
            const p = m.input;
            if (p == null) return false;
            if (selection.label === "Free") return p === 0;
            return p >= range.min && p < range.max;
          })
        : [];
      return {
        filtered,
        header: {
          title: `${selection.label} /1M tokens`,
          badges: [
            {
              text: "input price",
              className: "bg-green-500/10 text-green-600 dark:text-green-400",
            },
          ],
        },
      };
    }
    case "region": {
      const filtered = models.filter((m) => m.region === selection.region);
      return {
        filtered,
        header: {
          title: `${regionFlag(selection.region)} ${COUNTRY_NAMES[selection.region] ?? selection.region}`,
        },
      };
    }
    case "modelType": {
      const filtered = models.filter(
        (m) => (m.model_type ?? "other") === selection.modelType,
      );
      return {
        filtered,
        header: {
          title: selection.modelType,
          badges: [
            { text: "model type", className: "bg-muted text-muted-foreground" },
          ],
        },
      };
    }
    case "license": {
      const filtered = models.filter((m) => m.license === selection.license);
      const isOpen = OPEN_LICENSES.has(selection.license);
      return {
        filtered,
        header: {
          title: selection.license,
          badges: [
            {
              text: isOpen ? "open source" : "proprietary",
              className: isOpen
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            },
          ],
        },
      };
    }
    case "family": {
      const filtered = models.filter((m) => m.family === selection.family);
      return {
        filtered,
        header: {
          title: selection.family,
          badges: [
            {
              text: "family",
              className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            },
          ],
        },
      };
    }
    case "providerRank": {
      const filtered = models.filter((m) => m.provider === selection.provider);
      return {
        filtered,
        header: {
          title: filtered[0]?.providerName ?? selection.provider,
          badges: [
            { text: "provider", className: "bg-muted text-muted-foreground" },
          ],
        },
      };
    }
    case "contextRange": {
      const range = CTX_RANGES[selection.label];
      const filtered = range
        ? models.filter(
            (m) =>
              m.context_window != null &&
              m.context_window >= range.min &&
              m.context_window < range.max,
          )
        : [];
      return {
        filtered,
        header: {
          title: `${selection.label} context`,
          badges: [
            {
              text: "context window",
              className:
                "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            },
          ],
        },
      };
    }
    case "modality": {
      const inputSet = new Set(selection.input.split("+"));
      const outputSet = new Set(selection.output.split("+"));
      const filtered = models.filter((m) => {
        const mi = new Set(m.modalities_input ?? []);
        const mo = new Set(m.modalities_output ?? []);
        return (
          inputSet.size === mi.size &&
          [...inputSet].every((x) => mi.has(x)) &&
          outputSet.size === mo.size &&
          [...outputSet].every((x) => mo.has(x))
        );
      });
      return {
        filtered,
        header: {
          title: `${selection.input.replace(/\+/g, ", ")} → ${selection.output.replace(/\+/g, ", ")}`,
          badges: [
            {
              text: "modality",
              className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            },
          ],
        },
      };
    }
    default:
      return { filtered: [], header: { title: "Unknown" } };
  }
}

/* ── Helpers ── */

interface ProviderGroup {
  provider: string;
  name: string;
  icon?: string;
  models: AnalyticsModel[];
}

function groupByProvider(models: AnalyticsModel[]): ProviderGroup[] {
  const map = new Map<string, ProviderGroup>();
  for (const m of models) {
    const group = map.get(m.provider) ?? {
      provider: m.provider,
      name: m.providerName,
      icon: m.providerIcon,
      models: [],
    };
    // Dedup: skip if same provider+id+region already in group
    if (
      group.models.some(
        (x) => x.id === m.id && x.region === m.region,
      )
    )
      continue;
    group.models.push(m);
    map.set(m.provider, group);
  }
  return [...map.values()].sort((a, b) => b.models.length - a.models.length);
}

function formatMeta(m: AnalyticsModel, sel: Selection): string {
  if (sel.type === "price" && m.input != null) return `$${m.input}`;
  if (
    (sel.type === "contextRange" ||
      (sel.type === "month" && sel.chart === "context")) &&
    m.context_window
  )
    return formatTokens(m.context_window);
  if (m.input != null) return `$${m.input}/M`;
  return "";
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background flex items-center gap-2 px-3 py-2.5">
      <Icon size={12} className="text-muted-foreground/50 shrink-0" />
      <div className="min-w-0">
        <div className="text-muted-foreground text-[10px]">{label}</div>
        <div className="text-foreground font-mono text-xs">{value}</div>
      </div>
    </div>
  );
}
