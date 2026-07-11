import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EndpointCard } from "@/components/shared/endpoint-card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Row } from "@/components/ui/row";
import { Section } from "@/components/ui/section";
import { API_BASE, sections } from "@/lib/api-docs-data";
import { McpSetup } from "./mcp-setup";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "API" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/docs/api",
        en: "/en/docs/api",
        "x-default": "/docs/api",
      },
    },
  };
}

export default async function ApiDocsPage() {
  const t = await getTranslations("API");
  return (
    <PageContainer>
      <PageHeader title={t("title")} sub={t("subtitle")} />
      <div className="ring-border mb-8 overflow-hidden rounded-md ring-1">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-foreground text-sm">{t("rest")}</span>
          <code className="text-foreground truncate font-mono text-sm">
            {API_BASE}/v1
          </code>
        </div>
        <div className="border-border flex items-center justify-between gap-4 border-t px-4 py-3">
          <span className="text-muted-foreground text-sm">{t("mcp")}</span>
          <code className="text-foreground truncate font-mono text-sm">
            {API_BASE}/mcp
          </code>
        </div>
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <span className="text-muted-foreground text-sm">{t("format")}</span>
          <span className="text-foreground text-sm">{t("formatNote")}</span>
        </div>
      </div>

      <Section title={t("mcpSetup")}>
        <McpSetup />
      </Section>

      {sections.map((section) => (
        <Section
          key={section.title}
          title={t(section.title.toLowerCase() as any) ?? section.title}
        >
          <div className="space-y-4">
            {section.endpoints.map((ep) => (
              <EndpointCard
                key={ep.path}
                path={ep.path}
                tryPath={ep.tryPath}
                description={ep.desc}
                params={ep.params}
                mcp={ep.mcp}
              />
            ))}
          </div>
        </Section>
      ))}

      <Section title={t("responseFormat")}>
        <div className="ring-border overflow-hidden rounded-md text-sm ring-1">
          <div className="border-border flex items-baseline gap-4 border-b px-4 py-2.5">
            <span className="text-muted-foreground w-16 shrink-0 sm:w-24">
              {t("success")}
            </span>
            <code className="text-muted-foreground">
              {'{ "data": ..., "meta": { "total", "limit", "offset" } }'}
            </code>
          </div>
          <div className="border-border flex items-baseline gap-4 border-b px-4 py-2.5">
            <span className="text-muted-foreground w-16 shrink-0 sm:w-24">
              {t("error")}
            </span>
            <code className="text-muted-foreground">
              {'{ "error": { "message", "status" } }'}
            </code>
          </div>
        </div>
      </Section>

      <Section title={t("conventions")}>
        <div className="ring-border overflow-hidden rounded-md text-sm ring-1">
          <Row label={t("fieldPresent")} value={t("knownValue")} />
          <Row label={t("fieldOmitted")} value={t("unknownValue")} />
          <Row label={t("fieldIsNull")} value={t("notApplicable")} />
          <Row label="pricing.*" value="USD per 1M tokens" />
          <Row label="context_window" value="Token count" />
          <Row label="capabilities.*" value={t("booleanFlags")} />
          <Row
            label="modalities.*"
            value={`${t("arrayOf")}"text", "image", "audio", "video"`}
          />
          <Row label="performance / speed" value={t("scale15")} />
          <Row label="status" value={t("statusValues")} />
        </div>
      </Section>

      <Section title={t("notes")}>
        <div className="ring-border overflow-hidden rounded-md text-sm ring-1">
          <Row label={t("auth")} value={t("authDesc")} />
          <Row label={t("cors")} value={t("corsDesc")} />
          <Row label={t("rateLimit")} value={t("rateLimitDesc")} />
        </div>
      </Section>
    </PageContainer>
  );
}
