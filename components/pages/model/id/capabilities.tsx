import {
  Braces,
  Brain,
  CircleHelp,
  Eye,
  Hammer,
  Layers,
  Lightbulb,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InheritedBadge } from "@/components/shared/model-detail";
import { Section } from "@/components/ui/section";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import type { EnrichedModel } from "@/lib/data";

const CAP_MAP = {
  vision: { label: "vision", icon: Eye },
  tool_call: { label: "tool call", icon: Hammer },
  structured_output: { label: "structured output", icon: Braces },
  reasoning: { label: "reasoning", icon: Brain },
  json_mode: { label: "json mode", icon: Lightbulb },
  streaming: { label: "streaming", icon: Play },
  fine_tuning: { label: "fine tuning", icon: SlidersHorizontal },
  batch: { label: "batch", icon: Layers },
} as const;

const CAP_KEYS = Object.keys(CAP_MAP) as (keyof typeof CAP_MAP)[];

export async function CapabilitiesGrid({
  model,
  inherited,
}: {
  model: EnrichedModel;
  inherited?: Set<string>;
}) {
  const t = await getTranslations("Model");
  return (
    <Section id="capabilities" title={t("capabilities")}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CAP_KEYS.map((key) => {
          const val = model.capabilities?.[key];
          const unknown = val == null;
          const { label, icon: Icon } = CAP_MAP[key];
          const isInherited = inherited?.has(`capabilities.${key}`);
          return (
            <div
              key={key}
              className={cn(
                "bg-card border-border/40 hover:border-border flex items-center gap-2.5 rounded-lg border px-3 py-3 transition-colors",
                val === true ? "border-primary/10 bg-primary/5" : "",
              )}
            >
              <Icon
                size={14}
                className={cn(
                  "shrink-0",
                  val === true ? "text-primary" : "text-muted-foreground/30",
                )}
              />
              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  val === true ? "text-foreground" : "text-muted-foreground/30",
                )}
              >
                {label}
              </span>
              {unknown && (
                <Tooltip>
                  <TooltipTrigger>
                    <CircleHelp
                      size={12}
                      className="text-muted-foreground/30 shrink-0"
                    />
                  </TooltipTrigger>
                  <TooltipContent>No data available</TooltipContent>
                </Tooltip>
              )}
              {isInherited && <InheritedBadge from={model.inheritedFrom} />}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
