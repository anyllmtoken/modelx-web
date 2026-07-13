import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MetricCard } from "@/components/shared/model-detail";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { ProviderLinks } from "@/components/shared/provider-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@/components/ui/row";
import { TYPE_LABELS } from "@/lib/constants";
import type { ProviderWithModels } from "@/lib/data";
import { regionFlag } from "@/lib/format";

export async function ProviderDetailHeader({
  provider,
  family,
}: {
  provider: ProviderWithModels;
  family?: string;
}) {
  const t = await getTranslations("Providers");
  const tc = await getTranslations("Common");
  const activeCount = provider.models.filter(
    (m) => m.status !== "deprecated",
  ).length;
  const deprecatedCount = provider.models.length - activeCount;
  const families = new Set(
    provider.models.map((m) => m.family).filter(Boolean),
  );

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2.5">
        <ProviderIcon provider={provider} size={20} />
        <h1 className="text-foreground text-lg font-medium tracking-tight">
          {family ? `${provider.name} · ${family}` : provider.name}
        </h1>
        {provider.type && (
          <Badge>{TYPE_LABELS[provider.type] ?? provider.type}</Badge>
        )}
        {provider.openai_compatible && (
          <Badge className="bg-info/10 text-info">
            {t("openaiCompatible")}
          </Badge>
        )}
        <span className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" title={tc("export")} />}
          >
            <Download size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
            <DropdownMenuLabel>{tc("export")}</DropdownMenuLabel>
            <DropdownMenuItem
              render={
                <a
                  href={`/api/export?format=json&provider=${provider.id}`}
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
                  href={`/api/export?format=csv&provider=${provider.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {tc("csv")}
            </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ProviderLinks
          url={provider.url}
          docsUrl={provider.docs_url}
          pricingUrl={provider.pricing_url}
          statusUrl={provider.status_url}
          changelogUrl={provider.changelog_url}
          playgroundUrl={provider.playground_url}
          tokenizerUrl={provider.tokenizer_url}
          sdk={provider.sdk}
          githubUrl={provider.github_url}
          blogUrl={provider.blog_url}
          twitterUrl={provider.twitter_url}
          discordUrl={provider.discord_url}
          termsUrl={provider.terms_url}
          supportUrl={provider.support_url}
        />
      </div>

      {provider.description && (
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {provider.description}
        </p>
      )}

      <div className="bg-border ring-border grid grid-cols-2 gap-px overflow-hidden rounded-md ring-1">
        <MetricCard
          label={t("activeModels")}
          value={String(activeCount)}
          sub={
            deprecatedCount > 0 ? `+ ${deprecatedCount} deprecated` : undefined
          }
        />
        <MetricCard label={t("families")} value={String(families.size)} />
      </div>

      <div className="ring-border overflow-hidden rounded-md ring-1">
        <Row
          label={t("headquarters")}
          value={`${regionFlag(provider.region)} ${provider.headquarters ?? provider.region}`}
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.headquarters ?? provider.region)}`}
        />
        {provider.founded && (
          <Row label={t("founded")} value={String(provider.founded)} />
        )}
        <Row
          label={t("apiBaseUrl")}
          value={provider.api_url}
          mono
          copyValue={provider.api_url}
        />
        {provider.models_url && (
          <Row
            label={t("models")}
            value={provider.models_url.replace(/^https?:\/\//, "")}
            href={provider.models_url}
          />
        )}
      </div>
    </div>
  );
}
