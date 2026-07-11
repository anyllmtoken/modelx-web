import { getTranslations } from "next-intl/server";
import { DetailCell } from "@/components/shared/model-detail";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { Section } from "@/components/ui/section";
import type { Model, Provider } from "@/lib/data";
import { formatParams, formatTokens } from "@/lib/format";
import { normalizeModelId } from "@/lib/search";

function boolDisplay(
  value: boolean | undefined | null,
  tc?: (key: string) => string,
): string {
  if (value == null) return "—";
  return value ? (tc ? tc("yes") : "Yes") : tc ? tc("no") : "No";
}

const THINKING_MODE_LABELS: Record<string, string> = {
  extended: "Extended",
  adaptive: "Adaptive",
};

function creatorHref(
  originalModel: { provider: string; id: string } | null,
  creatorProvider: Provider | null | undefined,
  createdBy: string | undefined,
): string | undefined {
  if (originalModel) return `/${originalModel.provider}/${originalModel.id}`;
  if (creatorProvider) return `/${createdBy}`;
  return undefined;
}

export async function DetailsGrid({
  model,
  providerInfo,
  creatorProvider,
  originalModel,
  inh,
}: {
  model: Model;
  providerInfo: Provider | undefined;
  creatorProvider: Provider | null | undefined;
  originalModel: { provider: string; id: string } | null;
  inh: (field: string) => string | undefined;
}) {
  const t = await getTranslations("Model");
  const tc = await getTranslations("Common");
  const successors = model.successor
    ? Array.isArray(model.successor)
      ? model.successor
      : [model.successor]
    : null;

  return (
    <Section id="details" title={t("details")}>
      <div className="grid gap-2 sm:grid-cols-2">
        {normalizeModelId(model.id) !== normalizeModelId(model.name) && (
          <DetailCell label={t("modelId")} value={model.id} />
        )}
        <DetailCell
          label={t("provider")}
          value={providerInfo?.name ?? model.provider}
          href={`/${model.provider}`}
          icon={<ProviderIcon provider={providerInfo} size={14} />}
        />
        <DetailCell
          label={t("creator")}
          value={creatorProvider?.name ?? model.created_by}
          href={creatorHref(originalModel, creatorProvider, model.created_by)}
          icon={
            <ProviderIcon
              provider={creatorProvider ?? providerInfo}
              size={14}
            />
          }
        />
        <DetailCell
          label={t("family")}
          value={model.family ?? "—"}
          href={
            model.family
              ? `/${model.provider}?family=${model.family}`
              : undefined
          }
        />
        <DetailCell
          label={t("license")}
          value={model.license ?? "—"}
          inheritedFrom={inh("license")}
        />
        <DetailCell
          label={t("parameters")}
          value={formatParams(model.parameters, model.active_parameters) ?? "—"}
          inheritedFrom={inh("parameters")}
        />
        <DetailCell
          label={t("status")}
          value={model.status ?? "—"}
          inheritedFrom={inh("status")}
        />
        <DetailCell
          label={t("inputModalities")}
          value={model.modalities?.input?.join(", ") ?? "—"}
          inheritedFrom={inh("modalities")}
        />
        <DetailCell
          label={t("outputModalities")}
          value={model.modalities?.output?.join(", ") ?? "—"}
          inheritedFrom={inh("modalities")}
        />
        <DetailCell
          label={t("architecture")}
          value={model.architecture ?? "—"}
          inheritedFrom={inh("architecture")}
        />
        <DetailCell
          label={t("knowledgeCutoff")}
          value={model.knowledge_cutoff ?? "—"}
          dateTime={model.knowledge_cutoff ?? undefined}
          inheritedFrom={inh("knowledge_cutoff")}
        />
        <DetailCell
          label={t("trainingDataCutoff")}
          value={model.training_data_cutoff ?? "—"}
          dateTime={model.training_data_cutoff ?? undefined}
          inheritedFrom={inh("training_data_cutoff")}
        />
        <DetailCell
          label={t("releaseDate")}
          value={model.release_date ?? "—"}
          dateTime={model.release_date ?? undefined}
          inheritedFrom={inh("release_date")}
        />
        <DetailCell
          label={t("deprecationDate")}
          value={model.deprecation_date ?? "—"}
          dateTime={model.deprecation_date ?? undefined}
          inheritedFrom={inh("deprecation_date")}
        />
        {model.retirement_date && (
          <DetailCell
            label={t("retirementDate")}
            value={model.retirement_date}
            dateTime={model.retirement_date}
            inheritedFrom={inh("retirement_date")}
          />
        )}
        <DetailCell
          label={t("type")}
          value={model.model_type ?? "—"}
          inheritedFrom={inh("model_type")}
        />
        <DetailCell
          label={t("reasoningTokens")}
          value={boolDisplay(model.reasoning_tokens, tc)}
          inheritedFrom={inh("reasoning_tokens")}
        />
        <DetailCell
          label={t("maxInput")}
          value={
            model.max_input_tokens != null
              ? `${formatTokens(model.max_input_tokens)} tokens`
              : "—"
          }
        />
        {model.batch_max_output_tokens != null && (
          <DetailCell
            label={t("maxOutputBatch")}
            value={`${formatTokens(model.batch_max_output_tokens)} tokens`}
            inheritedFrom={inh("batch_max_output_tokens")}
          />
        )}
        {successors && (
          <DetailCell
            label={t("successor")}
            value={successors.join(", ")}
            href={`/${model.provider}/${successors[0]}`}
          />
        )}
        {Array.isArray(model.thinking_modes) &&
          model.thinking_modes.length > 0 && (
            <DetailCell
              label={t("thinkingModes")}
              value={model.thinking_modes
                .map((m) => THINKING_MODE_LABELS[m] ?? m)
                .join(", ")}
            />
          )}
        {typeof model.priority_tier === "boolean" && (
          <DetailCell
            label={t("priorityTier")}
            value={model.priority_tier ? "Yes" : "No"}
          />
        )}
        <DetailCell
          label={t("openWeight")}
          value={boolDisplay(model.open_weight, tc)}
          inheritedFrom={inh("open_weight")}
        />
        {model.capabilities?.prompt_caching && (
          <DetailCell label={t("promptCaching")} value={tc("yes")} />
        )}
        {typeof model.bedrock_id === "string" && (
          <DetailCell label={t("awsBedrockId")} value={model.bedrock_id} />
        )}
        {typeof model.vertex_id === "string" && (
          <DetailCell label={t("gcpVertexId")} value={model.vertex_id} />
        )}
        <DetailCell label={t("source")} value={model.source} />
        <DetailCell
          label={t("lastUpdated")}
          value={model.last_updated}
          dateTime={model.last_updated}
        />
      </div>
    </Section>
  );
}
