import { Download, GitCompareArrows, History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModelIdCopy } from "@/components/pages/model/id/id-copy";
import { RenderMarkdown } from "@/components/shared/markdown";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Model, Provider } from "@/lib/data";
import { formatParams } from "@/lib/format";

export async function ModelDetailHeader({
  model,
  providerInfo,
  provider,
  modelId,
  changesCount,
}: {
  model: Model;
  providerInfo: Provider | undefined;
  provider: string;
  modelId: string;
  changesCount: number;
}) {
  const t = await getTranslations("Model");
  const tc = await getTranslations("Common");
  const ts = await getTranslations("Status");
  const successors = model.successor
    ? Array.isArray(model.successor)
      ? model.successor
      : [model.successor]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <a
          href={`/${model.provider}`}
          className="shrink-0 transition-opacity duration-200 hover:opacity-70"
        >
          <ProviderIcon provider={providerInfo} size={22} />
        </a>
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          {model.name}
        </h1>
        {model.model_type && model.model_type !== "chat" && (
          <Badge variant="secondary">{model.model_type}</Badge>
        )}
        {model.status === "deprecated" && (
          <Badge className="bg-danger/10 text-danger border-danger/20">
            {ts("deprecated")}
          </Badge>
        )}
        {model.status === "preview" && (
          <Badge className="bg-warning/10 text-warning-foreground border-warning/20">
            {ts("preview")}
          </Badge>
        )}
        {model.license && (
          <Badge
            variant={model.license !== "proprietary" ? "gradient" : "secondary"}
          >
            {model.license}
          </Badge>
        )}
        {model.parameters != null && (
          <Badge variant="outline">
            {formatParams(model.parameters, model.active_parameters)}
          </Badge>
        )}
        <span className="flex-1" />

        <ButtonLink
          href={`/compare?a=${encodeURIComponent(`${model.provider}/${model.alias ?? model.id}`)}`}
          variant="outline"
          size="icon-sm"
          aria-label={t("compareThisModel")}
        >
          <GitCompareArrows size={14} />
        </ButtonLink>
        {changesCount > 0 && (
          <ButtonLink
            href={`/${provider}/${modelId}/changes`}
            variant="outline"
            size="icon-sm"
            aria-label={t("changeHistory")}
          >
            <History size={14} />
          </ButtonLink>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={t("exportModelData")}
              />
            }
          >
            <Download size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass glass-border">
            <DropdownMenuLabel>{tc("export")}</DropdownMenuLabel>
            <DropdownMenuItem
              render={
                <a
                  href={`https://api.anyllmtoken.com/v1/export?format=json&provider=${provider}&model=${encodeURIComponent(model.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {tc("json")}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <a
                  href={`https://api.anyllmtoken.com/v1/export?format=csv&provider=${provider}&model=${encodeURIComponent(model.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {tc("csv")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModelIdCopy
          groups={[
            {
              label: t("modelId"),
              items: [
                { label: model.id, value: model.id },
                ...(model.alias
                  ? [{ label: t("alias"), value: model.alias }]
                  : []),
                ...(model.snapshots ?? [])
                  .filter((s) => s !== model.id)
                  .map((s) => ({ label: t("snapshot"), value: s })),
              ],
            },
            {
              label: t("links"),
              items: [
                {
                  label: t("apiEndpoint"),
                  value: `/v1/models/${model.provider}/${model.id}`,
                },
                ...(providerInfo?.api_url
                  ? [{ label: t("providerApi"), value: providerInfo.api_url }]
                  : []),
                ...(model.page_url
                  ? [{ label: t("modelPage"), value: model.page_url }]
                  : []),
              ],
            },
          ]}
        />
      </div>

      {(model.description || model.tagline || successors) && (
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {model.description ? (
            <RenderMarkdown text={model.description} />
          ) : (
            model.tagline
          )}
          {successors && (
            <>
              {(model.description || model.tagline) && " · "}
              {t("succeededBy")}{" "}
              {successors.map((s, i) => (
                <span key={s}>
                  {i > 0 && ` ${t("or")} `}
                  <a
                    href={`/${model.provider}/${s}`}
                    className="text-primary hover:text-primary/70 font-medium transition-colors duration-200"
                  >
                    {s}
                  </a>
                </span>
              ))}
            </>
          )}
        </p>
      )}
    </div>
  );
}
