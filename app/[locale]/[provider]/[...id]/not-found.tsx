import { getTranslations } from "next-intl/server";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";

export default async function ModelNotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <h1 className="text-foreground font-mono text-6xl font-medium">404</h1>
      <p className="text-muted-foreground mt-3 text-balance">
        {t("modelNotFound")}
      </p>
      <p className="text-muted-foreground mt-2 max-w-md text-sm text-pretty">
        {t("modelNotFoundDesc")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/">{t("backToHome")}</ButtonLink>
        <ButtonLink href="/models">{t("browseModels")}</ButtonLink>
        <ButtonAnchor
          href="https://gitee.com/fastauth/model-x/issues/new?title=Missing+model:+&labels=missing-model"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("helpUsImprove")}
        </ButtonAnchor>
      </div>
    </div>
  );
}
