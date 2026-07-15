import { getTranslations } from "next-intl/server";
import { PriceCell } from "@/components/shared/model-detail";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { ModelPricing } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export async function PricingSection({
  pricing,
  pricingNotes,
  fastModePricing,
  currency,
}: {
  pricing: ModelPricing;
  pricingNotes?: string[];
  fastModePricing?: { input: number; output: number };
  currency?: string;
}) {
  const t = await getTranslations("Model");
  if (!Object.values(pricing).some((v) => v != null)) return null;

  const has1hCache = pricing.cache_write_1h != null;
  const cacheWriteLabel = has1hCache ? "Cache write (5m)" : "Cache write";

  return (
    <Section id="pricing" title={t("pricing")}>
      {pricing.tiers?.length ? (
        <div className="space-y-6">
          {pricing.tiers.map((tier) => (
            <div key={tier.label}>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-foreground text-sm font-medium">
                  {tier.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {tier.unit}
                </span>
              </div>
              <div className="border-border/40 overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-xs">
                      <th className="px-4 py-2.5 text-left font-medium" />
                      {tier.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2.5 text-right font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tier.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-border/40 hover:bg-muted/30 border-t transition-colors"
                      >
                        <td className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                          {row.label}
                        </td>
                        {row.values.map((val, i) => (
                          <td
                            key={tier.columns[i]}
                            className="text-foreground px-4 py-2.5 text-right font-mono text-sm font-medium tabular-nums"
                          >
                            {val != null ? formatPrice(val, currency) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <PricingNotes notes={pricingNotes} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <PriceCell label="Input" value={pricing.input} currency={currency} />
            <PriceCell label="Output" value={pricing.output} currency={currency} />
            <PriceCell label={cacheWriteLabel} value={pricing.cache_write} currency={currency} />
            {has1hCache && (
              <PriceCell
                label="Cache write (1h)"
                value={pricing.cache_write_1h}
                currency={currency}
              />
            )}
            <PriceCell label="Cache read" value={pricing.cached_input} currency={currency} />
            <PriceCell label="Batch in" value={pricing.batch_input} currency={currency} />
            <PriceCell label="Batch out" value={pricing.batch_output} currency={currency} />
          </div>
          {fastModePricing && (
            <div className="border-border/40 mt-3 overflow-hidden rounded-xl border">
              <div className="bg-muted/50 border-border/40 border-b px-4 py-2 text-xs">
                <span className="text-foreground font-medium">Fast mode</span>{" "}
                <span className="text-muted-foreground">
                  (beta, research preview)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                <PriceCell label="Input" value={fastModePricing.input} currency={currency} />
                <PriceCell label="Output" value={fastModePricing.output} currency={currency} />
              </div>
            </div>
          )}
          <PricingNotes notes={pricingNotes} className="mt-4" />
        </>
      )}
    </Section>
  );
}

function PricingNotes({
  notes,
  className,
}: {
  notes?: string[];
  className?: string;
}) {
  if (!notes?.length) return null;
  return (
    <div className={cn("space-y-1", className)}>
      {notes.map((note) => (
        <p
          key={note.slice(0, 40)}
          className="text-muted-foreground/70 text-xs leading-relaxed"
        >
          {note}
        </p>
      ))}
    </div>
  );
}
