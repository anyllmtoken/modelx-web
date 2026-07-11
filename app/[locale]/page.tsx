import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Disclaimer } from "@/components/pages/home/disclaimer";
import { ProviderGrid } from "@/components/pages/home/provider-grid";
import { SearchBar } from "@/components/pages/home/search-bar";
import { StatsGrid } from "@/components/pages/home/stats-grid";
import {
  BarChart3,
  Code,
  GitCompareArrows,
  History,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Section } from "@/components/ui/section";
import { FEATURED_PROVIDERS } from "@/lib/constants";
import { allModels, getProvider, providers } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/",
        en: "/en",
        "x-default": "/",
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const families = new Set(allModels.map((m) => m.family).filter(Boolean));

  const featuredProviders = FEATURED_PROVIDERS.map((id) =>
    providers.find((p) => p.id === id),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      {/* Hero — full width gradient */}
      <section className="dark:to-background bg-linear-to-b from-[#DBEAFE] to-[#F9FAFB] py-20 text-center max-md:py-12 dark:from-[#0F172A]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h1 className="text-foreground mb-3 text-[32px] font-bold tracking-tight max-md:text-[26px]">
            ModelX
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-[620px] text-lg leading-relaxed">
            {t("description")}
          </p>

          <div className="mb-[18px]">
            <SearchBar
              items={[
                ...providers.map((p) => ({
                  id: `p-${p.id}`,
                  name: p.name,
                  href: `/${p.id}`,
                  sub: `${p.models.length} ${t("models_count")}`,
                  icon: p.icon,
                  type: "provider" as const,
                })),
                ...allModels
                  .filter((m) => m.status !== "deprecated" && !m.alias)
                  .map((m) => {
                    const p = getProvider(m.provider);
                    return {
                      id: `${m.provider}/${m.id}`,
                      name: m.name,
                      href: `/${m.provider}/${m.id}`,
                      sub: p?.name ?? m.provider,
                      icon: p?.icon,
                      type: "model" as const,
                      providerType: (p?.type as string) ?? "direct",
                    };
                  }),
              ]}
            />
          </div>

          <StatsGrid
            items={[
              { label: t("statsModels"), value: allModels.length },
              { label: t("statsProviders"), value: providers.length },
              { label: t("statsFamilies"), value: families.size },
            ]}
          />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/models"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-2.5 text-[15px] font-semibold text-white no-underline shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow-md"
            >
              <Search size={18} />
              {t("browseAllModels")}
            </Link>
            <span className="text-border mx-1 hidden h-5 w-px bg-current sm:block" />
            <Link
              href="/compare"
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground text-sm no-underline transition-colors"
            >
              <GitCompareArrows
                size={14}
                className="mr-1.5 inline-block -translate-y-px"
              />
              {t("compareModels")}
            </Link>
            <span className="text-border mx-1 h-3 w-px bg-current align-middle" />
            <Link
              href="/docs/api"
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground text-sm no-underline transition-colors"
            >
              <Code size={14} className="mr-1.5 inline-block -translate-y-px" />
              {t("apiReference")}
            </Link>
            <span className="text-border mx-1 h-3 w-px bg-current align-middle" />
            <Link
              href="/changes"
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground text-sm no-underline transition-colors"
            >
              <History
                size={14}
                className="mr-1.5 inline-block -translate-y-px"
              />
              {t("recentChanges")}
            </Link>
            <span className="text-border mx-1 h-3 w-px bg-current align-middle" />
            <Link
              href="/analytics"
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground text-sm no-underline transition-colors"
            >
              <BarChart3
                size={14}
                className="mr-1.5 inline-block -translate-y-px"
              />
              {t("analytics")}
            </Link>
          </div>
        </div>
      </section>

      {/* Content — contained */}
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <Section title={t("featuredProviders")}>
          <ProviderGrid
            providers={featuredProviders}
            total={providers.length}
            modelsLabel={t("modelsLabel")}
            viewAllLabel={t("viewAll")}
            providersTotalLabel={t("providersTotal")}
          />
        </Section>

        <Disclaimer />
      </div>
    </>
  );
}
