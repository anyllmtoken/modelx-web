import { getTranslations } from "next-intl/server";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { NEW_ISSUE_URL } from "@/lib/config";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <h1 className="text-foreground font-mono text-6xl font-medium">404</h1>
      <p className="text-muted-foreground mt-3 text-balance">{t("title")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/">{t("backToHome")}</ButtonLink>
        <ButtonAnchor
          href={NEW_ISSUE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("helpUsImprove")}
        </ButtonAnchor>
      </div>
    </div>
  );
}
