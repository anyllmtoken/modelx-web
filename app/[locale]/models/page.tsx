import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModelList } from "@/components/shared/model-list";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { PROVIDER_TYPE_TIER } from "@/lib/constants";
import { allModels, getProvider } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Models" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/models",
        en: "/en/models",
        "x-default": "/models",
      },
    },
  };
}

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("Models");
  const { q } = await searchParams;
  const items = allModels
    .map((m) => {
      const p = getProvider(m.provider);
      return {
        ...m,
        providerIcon: p?.icon,
        providerType: p?.type ?? "direct",
      };
    })
    .sort(
      (a, b) =>
        (PROVIDER_TYPE_TIER[b.providerType] ?? 0) -
        (PROVIDER_TYPE_TIER[a.providerType] ?? 0),
    );

  return (
    <PageContainer>
      <PageHeader title={t("title")} count={items.length} sub={t("subtitle")} />
      <ModelList
        models={items}
        showProvider
        searchable
        initialQuery={q}
        searchPlaceholder={t("searchPlaceholder")}
        ossLabel={t("oss")}
      />
    </PageContainer>
  );
}
