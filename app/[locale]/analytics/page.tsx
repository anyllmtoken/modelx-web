import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnalyticsDashboard } from "@/components/pages/analytics/dashboard";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { computeAnalytics } from "@/lib/analytics";
import { allModels, providers } from "@/lib/data";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Analytics" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/analytics",
        en: "/en/analytics",
        "x-default": "/analytics",
      },
    },
  };
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Analytics" });
  const data = computeAnalytics(allModels, providers);

  return (
    <PageContainer>
      <PageHeader title={t("title")} sub={t("subtitle")} />
      <AnalyticsDashboard data={data} />
    </PageContainer>
  );
}
