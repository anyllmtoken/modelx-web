import { MetricCard, RatingCard } from "@/components/shared/model-detail";
import type { ModelData } from "@/lib/data";
import { formatPrice, formatTokens } from "@/lib/format";

function getPrimaryPrice(
  model: ModelData,
  currency?: string,
): { label: string; value: string; sub?: string } | null {
  const tier = model.pricing?.tiers?.[0];
  if (!tier) return null;
  const stdRow = tier.rows.find((r) => r.label === "Standard") ?? tier.rows[0];
  if (!stdRow) return null;
  const prefix = currency === "CNY" ? "¥" : "$";

  for (let i = 0; i < tier.columns.length; i++) {
    if (tier.columns[i] === "Quality") continue;
    if (stdRow.values[i] != null) {
      return {
        label: tier.label === "Text tokens" ? "Price" : tier.label,
        value: `${prefix}${stdRow.values[i]}`,
        sub: tier.unit ? `/${tier.unit.replace("Per ", "")}` : undefined,
      };
    }
  }
  return null;
}

function getPriceCards(
  model: ModelData,
  inh: (field: string) => string | undefined,
  currency?: string,
): React.ReactNode[] {
  const hasTokenPricing =
    model.pricing?.input != null || model.pricing?.output != null;

  if (hasTokenPricing) {
    return [
      <MetricCard
        key="inp"
        label="Input price"
        value={formatPrice(model.pricing?.input, currency)}
        sub={model.pricing?.input != null ? "/1M tokens" : undefined}
        inheritedFrom={inh("pricing")}
      />,
      <MetricCard
        key="outp"
        label="Output price"
        value={formatPrice(model.pricing?.output, currency)}
        sub={model.pricing?.output != null ? "/1M tokens" : undefined}
        inheritedFrom={inh("pricing")}
      />,
    ];
  }

  const primary = getPrimaryPrice(model);
  if (primary) {
    return [
      <MetricCard
        key="price"
        label={primary.label}
        value={primary.value}
        sub={primary.sub}
      />,
    ];
  }

  return [];
}

const RATING_FIELDS = [
  { key: "perf", field: "performance", label: "Intelligence" },
  { key: "reasoning", field: "reasoning", label: "Reasoning" },
  { key: "speed", field: "speed", label: "Speed" },
] as const;

export async function OverviewGrid({
  model,
  inh,
  currency,
}: {
  model: ModelData;
  inh: (field: string) => string | undefined;
  currency?: string;
}) {
  const cards: React.ReactNode[] = [
    ...RATING_FIELDS.filter((f) => model[f.field] != null).map((f) => (
      <RatingCard
        key={f.key}
        label={f.label}
        value={model[f.field]!}
        max={5}
        inheritedFrom={inh(f.field)}
      />
    )),
    model.context_window != null && (
      <MetricCard
        key="ctx"
        label="Context"
        value={formatTokens(model.context_window)}
        inheritedFrom={inh("context_window")}
      />
    ),
    model.max_context_window != null && (
      <MetricCard
        key="maxctx"
        label="Max context"
        value={formatTokens(model.max_context_window)}
      />
    ),
    model.max_output_tokens != null && (
      <MetricCard
        key="maxout"
        label="Max output"
        value={formatTokens(model.max_output_tokens)}
        inheritedFrom={inh("max_output_tokens")}
      />
    ),
    ...getPriceCards(model, inh, currency),
  ].filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <div id="overview" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards}
    </div>
  );
}
