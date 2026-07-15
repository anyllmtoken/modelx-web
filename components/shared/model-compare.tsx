"use client";

import { Link } from "@/i18n/routing";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Cable,
  Calendar,
  CircleDollarSign,
  Coins,
  Database,
  Eye,
  FileText,
  Gauge,
  Hammer,
  Hash,
  Layers,
  Lightbulb,
  Maximize,
  MessageSquare,
  Package,
  Play,
  Puzzle,
  SlidersHorizontal,
  Tag,
  Timer,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ModelPicker } from "@/components/shared/model-picker";
import { ProviderIcon } from "@/components/shared/provider-icon";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { PERF_LABELS, REASONING_LABELS, SPEED_LABELS } from "@/lib/constants";
import type { ModelCapabilities } from "@/lib/data";
import { formatPrice, formatTokens } from "@/lib/format";

interface CompareModel {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  providerIcon?: string;
  created_by?: string;
  creatorName?: string;
  creatorIcon?: string;
  family?: string;
  status?: string;
  model_type?: string;
  release_date?: string | null;
  context_window?: number | null;
  max_context_window?: number | null;
  max_output_tokens?: number | null;
  max_input_tokens?: number | null;
  knowledge_cutoff?: string | null;
  reasoning_tokens?: boolean;
  performance?: number;
  reasoning?: number;
  speed?: number;
  capabilities?: ModelCapabilities;
  modalities?: { input?: string[]; output?: string[] };
  pricing?: {
    input?: number | null;
    output?: number | null;
    cache_write?: number | null;
    cached_input?: number | null;
    batch_input?: number | null;
    batch_output?: number | null;
  };
  pricing_currency?: string;
  tools?: string[];
  endpoints?: string[];
  [key: string]: unknown;
}

function CompareRow({
  icon: Icon,
  label,
  a,
  b,
  diff,
}: {
  icon?: LucideIcon;
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  diff?: boolean;
}) {
  const cell =
    "flex items-center border-border border-l px-4 py-2.5 font-mono text-foreground text-sm";
  const diffCls = diff ? " bg-yellow-500/8" : "";
  return (
    <div className="border-border grid grid-cols-1 border-t sm:grid-cols-3">
      <div className="text-muted-foreground flex items-center gap-2 px-4 py-2.5 text-sm">
        {Icon && <Icon size={14} className="shrink-0" />}
        {label}
      </div>
      <div className={cn(cell, diffCls)}>{a ?? "—"}</div>
      <div className={cn(cell, diffCls)}>{b ?? "—"}</div>
    </div>
  );
}

function neq(a: unknown, b: unknown): boolean {
  return (a ?? null) !== (b ?? null);
}

function TagList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span>—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((t) => (
        <span
          key={t}
          className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[11px]"
        >
          {t.replace(/_/g, " ")}
        </span>
      ))}
    </span>
  );
}

function RatingDots({
  value,
  max = 5,
  labels,
}: {
  value?: number;
  max?: number;
  labels?: string[];
}) {
  if (value == null) return <span>—</span>;
  const description = labels?.[value] ?? `${value}/${max}`;
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="flex cursor-default gap-1">
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                i < value ? "bg-foreground" : "bg-border",
              )}
            />
          ))}
        </span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}

function optionalTokens(value?: number | null): string | null {
  return value != null ? formatTokens(value) : null;
}

function boolLabel(
  value?: boolean | null,
  tc?: (k: string) => string,
): string | null {
  if (value == null) return null;
  return value ? (tc ? tc("yes") : "Yes") : tc ? tc("no") : "No";
}

function CapBadge({
  supported,
  tc,
}: {
  supported?: boolean;
  tc?: (k: string) => string;
}) {
  if (supported == null)
    return (
      <Tooltip>
        <TooltipTrigger>
          <span className="text-muted-foreground cursor-default">—</span>
        </TooltipTrigger>
        <TooltipContent>
          {tc ? tc("noData") : "No data available"}
        </TooltipContent>
      </Tooltip>
    );
  return (
    <span className={supported ? "text-foreground" : "text-muted-foreground"}>
      {supported ? (tc ? tc("yes") : "Yes") : tc ? tc("no") : "No"}
    </span>
  );
}

function ModelHeader({ model }: { model: CompareModel }) {
  return (
    <Link
      href={`/${model.provider}/${model.id}`}
      className="border-border hover:bg-accent flex min-w-0 items-center gap-2 border-l px-4 py-3 transition-colors duration-200"
    >
      <ProviderIcon
        provider={model.providerIcon ? { icon: model.providerIcon } : null}
        size={14}
      />
      <span className="text-foreground truncate text-sm font-medium">
        {model.name}
      </span>
    </Link>
  );
}

function CreatorLink({
  id,
  name,
  icon,
}: {
  id?: string;
  name?: string;
  icon?: string;
}) {
  return (
    <a
      href={`/${id}`}
      className="hover:text-accent-foreground flex items-center gap-1.5 transition-colors duration-200"
    >
      <ProviderIcon provider={icon ? { icon } : null} size={13} />
      {name ?? id}
    </a>
  );
}

const CAP_KEYS: [keyof ModelCapabilities, string, LucideIcon][] = [
  ["reasoning", "reasoningLabel", Brain],
  ["vision", "visionLabel", Eye],
  ["tool_call", "toolCallLabel", Hammer],
  ["streaming", "streamingLabel", Play],
  ["structured_output", "structuredOutputLabel", Layers],
  ["json_mode", "jsonModeLabel", FileText],
  ["fine_tuning", "fineTuningLabel", SlidersHorizontal],
  ["batch", "batchLabel", Package],
];

function CompareInner({
  models,
  aliases,
}: {
  models: CompareModel[];
  aliases: Record<string, string>;
}) {
  const t = useTranslations("Compare");
  const tc = useTranslations("Common");
  const searchParams = useSearchParams();

  const rawA = searchParams.get("a");
  const rawB = searchParams.get("b");
  const modelA = rawA ? (aliases[rawA] ?? rawA) : null;
  const modelB = rawB ? (aliases[rawB] ?? rawB) : null;

  const a = modelA
    ? models.find((m) => `${m.provider}/${m.id}` === modelA)
    : null;
  const b = modelB
    ? models.find((m) => `${m.provider}/${m.id}` === modelB)
    : null;

  function setModels(aKey: string | null, bKey: string | null) {
    const params = new URLSearchParams();
    if (aKey) params.set("a", aKey);
    if (bKey) params.set("b", bKey);
    const qs = params.toString();
    // Not router.push: Next.js 16.2.x swallows searchParams-only navigations after a hard load with search params (vercel/next.js#92187).
    window.history.pushState(null, "", qs ? `/compare?${qs}` : "/compare");
  }

  return (
    <div>
      <div className="mb-8 flex gap-4">
        <ModelPicker
          models={models}
          selected={modelA}
          onSelect={(key) => setModels(key, modelB)}
          label={t("selectModelA")}
        />
        <ModelPicker
          models={models}
          selected={modelB}
          onSelect={(key) => setModels(modelA, key)}
          label={t("selectModelB")}
        />
      </div>

      {a && b ? (
        <div className="ring-border overflow-hidden rounded-md ring-1">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="text-muted-foreground px-4 py-3 text-xs tracking-wider uppercase" />
            <ModelHeader model={a} />
            <ModelHeader model={b} />
          </div>

          <CompareRow
            icon={User}
            label={t("creator")}
            diff={neq(a.created_by, b.created_by)}
            a={
              <CreatorLink
                id={a.created_by}
                name={a.creatorName}
                icon={a.creatorIcon}
              />
            }
            b={
              <CreatorLink
                id={b.created_by}
                name={b.creatorName}
                icon={b.creatorIcon}
              />
            }
          />
          <CompareRow
            icon={Tag}
            label={t("family")}
            a={a.family}
            b={b.family}
            diff={neq(a.family, b.family)}
          />
          <CompareRow
            icon={Hash}
            label={t("modelType")}
            a={a.model_type}
            b={b.model_type}
            diff={neq(a.model_type, b.model_type)}
          />
          <CompareRow
            icon={Puzzle}
            label={t("status")}
            a={a.status}
            b={b.status}
            diff={neq(a.status, b.status)}
          />
          <CompareRow
            icon={Calendar}
            label={t("releaseDate")}
            a={a.release_date}
            b={b.release_date}
            diff={neq(a.release_date, b.release_date)}
          />
          <CompareRow
            icon={MessageSquare}
            label={t("context")}
            a={optionalTokens(a.context_window)}
            b={optionalTokens(b.context_window)}
            diff={neq(a.context_window, b.context_window)}
          />
          <CompareRow
            icon={Maximize}
            label={t("maxContext")}
            a={optionalTokens(a.max_context_window)}
            b={optionalTokens(b.max_context_window)}
            diff={neq(a.max_context_window, b.max_context_window)}
          />
          <CompareRow
            icon={Maximize}
            label={t("maxOutput")}
            a={optionalTokens(a.max_output_tokens)}
            b={optionalTokens(b.max_output_tokens)}
            diff={neq(a.max_output_tokens, b.max_output_tokens)}
          />
          <CompareRow
            icon={Maximize}
            label={t("maxInput")}
            a={optionalTokens(a.max_input_tokens)}
            b={optionalTokens(b.max_input_tokens)}
            diff={neq(a.max_input_tokens, b.max_input_tokens)}
          />
          <CompareRow
            icon={Timer}
            label={t("knowledgeCutoff")}
            a={a.knowledge_cutoff}
            b={b.knowledge_cutoff}
            diff={neq(a.knowledge_cutoff, b.knowledge_cutoff)}
          />
          <CompareRow
            icon={Lightbulb}
            label={t("intelligence")}
            a={<RatingDots value={a.performance} labels={PERF_LABELS} />}
            b={<RatingDots value={b.performance} labels={PERF_LABELS} />}
            diff={neq(a.performance, b.performance)}
          />
          <CompareRow
            icon={Brain}
            label={t("reasoning")}
            a={<RatingDots value={a.reasoning} labels={REASONING_LABELS} />}
            b={<RatingDots value={b.reasoning} labels={REASONING_LABELS} />}
            diff={neq(a.reasoning, b.reasoning)}
          />
          <CompareRow
            icon={Gauge}
            label={t("speed")}
            a={<RatingDots value={a.speed} labels={SPEED_LABELS} />}
            b={<RatingDots value={b.speed} labels={SPEED_LABELS} />}
            diff={neq(a.speed, b.speed)}
          />

          <CompareRow
            icon={CircleDollarSign}
            label={t("inputPrice")}
            a={formatPrice(a.pricing?.input, a.pricing_currency)}
            b={formatPrice(b.pricing?.input, b.pricing_currency)}
            diff={neq(a.pricing?.input, b.pricing?.input)}
          />
          <CompareRow
            icon={CircleDollarSign}
            label={t("outputPrice")}
            a={formatPrice(a.pricing?.output, a.pricing_currency)}
            b={formatPrice(b.pricing?.output, b.pricing_currency)}
            diff={neq(a.pricing?.output, b.pricing?.output)}
          />
          <CompareRow
            icon={Database}
            label={t("cacheWrite")}
            a={formatPrice(a.pricing?.cache_write, a.pricing_currency)}
            b={formatPrice(b.pricing?.cache_write, b.pricing_currency)}
            diff={neq(a.pricing?.cache_write, b.pricing?.cache_write)}
          />
          <CompareRow
            icon={Database}
            label={t("cacheRead")}
            a={formatPrice(a.pricing?.cached_input, a.pricing_currency)}
            b={formatPrice(b.pricing?.cached_input, b.pricing_currency)}
            diff={neq(a.pricing?.cached_input, b.pricing?.cached_input)}
          />
          <CompareRow
            icon={Coins}
            label={t("batchInput")}
            a={formatPrice(a.pricing?.batch_input, a.pricing_currency)}
            b={formatPrice(b.pricing?.batch_input, b.pricing_currency)}
            diff={neq(a.pricing?.batch_input, b.pricing?.batch_input)}
          />
          <CompareRow
            icon={Coins}
            label={t("batchOutput")}
            a={formatPrice(a.pricing?.batch_output, a.pricing_currency)}
            b={formatPrice(b.pricing?.batch_output, b.pricing_currency)}
            diff={neq(a.pricing?.batch_output, b.pricing?.batch_output)}
          />
          <CompareRow
            icon={Zap}
            label={t("reasoningTokens")}
            a={boolLabel(a.reasoning_tokens, tc)}
            b={boolLabel(b.reasoning_tokens, tc)}
            diff={neq(a.reasoning_tokens, b.reasoning_tokens)}
          />

          {CAP_KEYS.map(([key, labelKey, capIcon]) => (
            <CompareRow
              key={key}
              icon={capIcon}
              label={t(labelKey)}
              a={<CapBadge supported={a.capabilities?.[key]} tc={tc} />}
              b={<CapBadge supported={b.capabilities?.[key]} tc={tc} />}
              diff={neq(a.capabilities?.[key], b.capabilities?.[key])}
            />
          ))}

          <CompareRow
            icon={Play}
            label={t("inputModalities")}
            a={a.modalities?.input?.join(", ")}
            b={b.modalities?.input?.join(", ")}
            diff={neq(
              a.modalities?.input?.join(","),
              b.modalities?.input?.join(","),
            )}
          />
          <CompareRow
            icon={Play}
            label={t("outputModalities")}
            a={a.modalities?.output?.join(", ")}
            b={b.modalities?.output?.join(", ")}
            diff={neq(
              a.modalities?.output?.join(","),
              b.modalities?.output?.join(","),
            )}
          />

          <CompareRow
            icon={Wrench}
            label={t("tools")}
            a={<TagList items={a.tools} />}
            b={<TagList items={b.tools} />}
            diff={neq(a.tools?.join(","), b.tools?.join(","))}
          />
          <CompareRow
            icon={Cable}
            label={t("endpoints")}
            a={<TagList items={a.endpoints} />}
            b={<TagList items={b.endpoints} />}
            diff={neq(a.endpoints?.join(","), b.endpoints?.join(","))}
          />
        </div>
      ) : (
        <div className="text-muted-foreground py-16 text-center text-sm text-balance">
          {t("selectTwoModels")}
        </div>
      )}
    </div>
  );
}

export function ModelCompare({
  models,
  aliases,
}: {
  models: CompareModel[];
  aliases: Record<string, string>;
}) {
  return (
    <Suspense>
      <CompareInner models={models} aliases={aliases} />
    </Suspense>
  );
}
