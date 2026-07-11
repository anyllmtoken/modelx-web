import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChangesList } from "@/components/shared/changes-list";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { getChanges, providers } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Changes" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        zh: "/changes",
        en: "/en/changes",
        "x-default": "/changes",
      },
    },
  };
}

export default async function ChangesPage() {
  const t = await getTranslations("Changes");
  const changes = getChanges();

  const providerIcons = Object.fromEntries(
    providers.map((p) => [p.id, p.icon]),
  );

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      <ChangesList entries={changes} providerIcons={providerIcons} />
    </PageContainer>
  );
}
