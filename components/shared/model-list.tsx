"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { multiSearch } from "@/lib/search";
import { CAP_LABELS } from "@/lib/constants";
import type { ModelCapabilities } from "@/lib/data";
import { formatPrice, formatTokens } from "@/lib/format";

export interface ModelItem {
  id: string;
  name: string;
  provider: string;
  created_by?: string;
  family?: string;
  status?: string;
  model_type?: string;
  context_window?: number | null;
  capabilities?: ModelCapabilities;
  pricing?: { input?: number | null; output?: number | null };
  pricing_currency?: string;
  providerIcon?: string;
  license?: string;
  parameters?: number | null;
  active_parameters?: number | null;
  region?: string;
  [key: string]: unknown;
}

function modelFilterFn(row: ModelItem, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const target =
    `${row.name} ${row.id} ${row.provider} ${row.created_by ?? ""} ${row.family ?? ""}`.toLowerCase();
  return terms.every((t) => target.includes(t));
}

function capBadges(caps: ModelCapabilities | undefined) {
  if (!caps) return null;
  return (
    <span className="flex gap-0.5">
      {CAP_LABELS.map(([key, letter]) => {
        const val = caps[key as keyof ModelCapabilities];
        if (val === true) {
          return (
            <span
              key={key}
              className="bg-muted text-foreground flex h-4 w-4 items-center justify-center rounded text-[10px]"
              title={key.replace(/_/g, " ")}
            >
              {letter}
            </span>
          );
        }
        if (val == null) {
          return (
            <span
              key={key}
              className="bg-muted text-muted-foreground/30 flex h-4 w-4 items-center justify-center rounded text-[10px]"
              title={`${key.replace(/_/g, " ")} (no data)`}
            >
              {letter}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}

function buildColumns(
  showProvider?: boolean,
  headers?: {
    model?: string;
    caps?: string;
    context?: string;
    pricing?: string;
  },
): ColumnDef<ModelItem>[] {
  return [
    {
      id: "model",
      accessorFn: (row) => row.name,
      header: headers?.model ?? "Model",
      enableSorting: false,
      meta: { className: "max-w-0 w-full" },
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              m.status === "deprecated" && "opacity-50",
            )}
          >
            {showProvider && (
              <ProviderIcon
                provider={m.providerIcon ? { icon: m.providerIcon } : null}
                size={13}
              />
            )}
            <div className="min-w-0 overflow-hidden">
              <span className="flex items-center gap-1.5">
                <span className="text-foreground truncate text-sm">
                  {m.name}
                </span>
                {m.region && (
                  <span className="text-muted-foreground shrink-0 text-[10px] font-medium">
                    {m.region === "CN" ? "🇨🇳" : "🌍"}
                  </span>
                )}
                {m.license && m.license !== "proprietary" && (
                  <Badge
                    className="bg-success/10 text-success shrink-0 text-[10px]"
                    title={m.license}
                  >
                    OSS
                  </Badge>
                )}
              </span>
              <span className="text-muted-foreground truncate font-mono text-xs">
                {m.id}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "caps",
      header: headers?.caps ?? "Caps",
      enableSorting: false,
      meta: {
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
      },
      cell: ({ row }) => capBadges(row.original.capabilities),
    },
    {
      accessorKey: "context_window",
      header: headers?.context ?? "Context",
      sortingFn: "basic",
      meta: {
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
      },
      cell: ({ row }) => {
        const v = row.original.context_window;
        return v ? (
          <span className="text-muted-foreground font-mono text-sm tabular-nums">
            {formatTokens(v)}
          </span>
        ) : null;
      },
    },
    {
      id: "pricing",
      accessorFn: (row) => row.pricing?.input ?? -1,
      header: headers?.pricing ?? "Pricing",
      sortingFn: "basic",
      meta: {
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
      },
      cell: ({ row }) => {
        const p = row.original.pricing;
        const currency = row.original.pricing_currency;
        if (p?.input == null && p?.output == null) return null;
        return (
          <span className="font-mono tabular-nums">
            <span className="text-foreground block text-sm">
              {formatPrice(p?.input, currency)}
            </span>
            <span className="text-muted-foreground block text-xs">
              {formatPrice(p?.output, currency)}
            </span>
          </span>
        );
      },
    },
  ];
}

function ModelSearchInput({
  value,
  onChange,
  placeholder,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  items: { id: string; name: string; provider: string; icon?: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    if (value.trim().length < 2) return [];
    return multiSearch(items, value, {
      target: (item) => `${item.name} ${item.provider} ${item.id}`,
      limit: 8,
    });
  }, [items, value]);

  const showDropdown =
    focused && value.trim().length >= 2 && results.length > 0;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onChange(results[activeIndex].name);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative mx-auto max-w-[680px]">
      <div className="dark:bg-card border-input focus-within:border-primary relative rounded-xl border-2 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <Search
          size={18}
          className="text-muted-foreground/50 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="placeholder:text-muted-foreground h-[52px] w-full rounded-xl border-0 bg-transparent pr-12 pl-11 text-[15px] outline-none"
        />
        {value && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ModelList({
  models,
  showProvider,
  searchable,
  initialQuery = "",
  searchPlaceholder,
  ossLabel,
  showDeprecatedLabel,
}: {
  models: ModelItem[];
  showProvider?: boolean;
  searchable?: boolean;
  initialQuery?: string;
  searchPlaceholder?: string;
  ossLabel?: string;
  showDeprecatedLabel?: string;
}) {
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [capFilters, setCapFilters] = useState<Set<string>>(new Set());
  const [ossOnly, setOssOnly] = useState(false);
  const [regionFilter, setRegionFilter] = useState("");

  function toggleCap(key: string) {
    setCapFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const deprecatedCount = models.filter(
    (m) => m.status === "deprecated",
  ).length;

  const types = [
    ...new Set(models.map((m) => m.model_type).filter(Boolean)),
  ].sort();

  let data =
    showDeprecated || deprecatedCount === 0
      ? models
      : models.filter((m) => m.status !== "deprecated");

  if (typeFilter) {
    data = data.filter((m) => m.model_type === typeFilter);
  }

  if (capFilters.size > 0) {
    data = data.filter((m) =>
      [...capFilters].every(
        (cap) => m.capabilities?.[cap as keyof ModelCapabilities],
      ),
    );
  }

  if (ossOnly) {
    data = data.filter((m) => m.license && m.license !== "proprietary");
  }

  if (regionFilter) {
    data = data.filter((m) => m.region === regionFilter);
  }

  const t = useTranslations("Models");

  // Autocomplete search component
  const searchItems = useMemo(
    () =>
      models.map((m) => ({
        id: `${m.provider}/${m.id}`,
        name: m.name,
        provider: m.provider,
        icon: m.providerIcon,
      })),
    [models],
  );

  const modelSearch = useCallback(
    ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (v: string) => void;
      placeholder: string;
    }) => (
      <ModelSearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        items={searchItems}
      />
    ),
    [searchItems],
  );

  const columns = buildColumns(showProvider, {
    model: t("model"),
    caps: t("caps"),
    context: t("context"),
    pricing: t("pricing"),
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder ?? t("searchPlaceholder")}
      initialQuery={initialQuery}
      globalFilterFn={modelFilterFn}
      getRowHref={(m) => `/${m.provider}/${m.id}`}
      noResultsText={t("noResults")}
      searchComponent={modelSearch}
      toolbar={
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {types.length > 1 && (
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v ?? "")}
                items={{
                  "": t("all"),
                  ...Object.fromEntries(types.map((t) => [t, t])),
                }}
              >
                <SelectTrigger className="dark:bg-card border-border hover:border-primary hover:text-primary h-8 min-w-[130px] gap-1 rounded-2xl bg-white px-3.5 text-[13px] transition-all">
                  <span className="text-muted-foreground">{t("type")}:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("all")}</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t!}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button
              type="button"
              onClick={() => setOssOnly(!ossOnly)}
              className={cn(
                "h-8 rounded-2xl border px-3.5 text-[13px] font-medium transition-all",
                ossOnly
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "dark:bg-card text-muted-foreground border-border hover:border-primary hover:text-primary bg-white",
              )}
            >
              {ossLabel ?? t("oss")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setRegionFilter(
                    regionFilter === "CN" ? "" : regionFilter === "US" ? "CN" : "US",
                  )
                }
                className={cn(
                  "h-8 rounded-2xl border px-3.5 text-[13px] font-medium transition-all",
                  regionFilter
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "dark:bg-card text-muted-foreground border-border hover:border-primary hover:text-primary bg-white",
                )}
              >
                {regionFilter === "CN" ? "🇨🇳 CN" : regionFilter === "US" ? "🌍 US" : "All Regions"}
              </button>
              {deprecatedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDeprecated(!showDeprecated)}
                className={cn(
                  "h-8 rounded-2xl border px-3.5 text-[13px] font-medium transition-all",
                  showDeprecated
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "dark:bg-card text-muted-foreground border-border hover:border-primary hover:text-primary bg-white",
                )}
              >
                {showDeprecatedLabel?.replace(
                  "{count}",
                  String(deprecatedCount),
                ) ?? t("showDeprecated", { count: deprecatedCount })}
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {CAP_LABELS.map(([key, letter]) => {
              const active = capFilters.has(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleCap(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-[12px] font-medium transition-all",
                    active
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "dark:bg-card text-muted-foreground border-border hover:border-primary hover:text-primary bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {letter}
                  </span>
                  {key.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
