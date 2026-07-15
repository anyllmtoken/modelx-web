import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModelCompare } from "@/components/shared/model-compare";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { allModels, getProvider } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Compare" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/compare",
        en: "/en/compare",
        "x-default": "/compare",
      },
    },
  };
}

export default async function ComparePage() {
  const t = await getTranslations("Compare");
  const models = allModels
    .filter((m) => !m.alias)
    .map((m) => {
      const p = getProvider(m.provider);
      const creator =
        m.created_by !== m.provider ? getProvider(m.created_by) : p;
      return {
        ...m,
        providerName: p?.name ?? m.provider,
        providerIcon: p?.icon,
        providerType: p?.type,
        creatorName: creator?.name ?? m.created_by,
        creatorIcon: creator?.icon,
        pricing_currency: p?.pricing_currency,
      };
    })
    .filter(
      (m, i, arr) =>
        arr.findIndex((x) => x.provider === m.provider && x.id === m.id) === i,
    );

  const aliases: Record<string, string> = {};
  for (const m of allModels) {
    if (m.alias) aliases[`${m.provider}/${m.id}`] = `${m.provider}/${m.alias}`;
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} sub={t("subtitle")} />
      <ModelCompare models={models} aliases={aliases} />
    </PageContainer>
  );
}
