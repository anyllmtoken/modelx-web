import { getTranslations } from "next-intl/server";
import { ISSUES_URL, REPO_URL } from "@/lib/config";

const linkClass =
  "underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:text-muted-foreground";

export async function Disclaimer() {
  const t = await getTranslations("Disclaimer");
  return (
    <p className="text-muted-foreground/60 text-center text-xs leading-relaxed text-pretty">
      {t("text")}{" "}
      <a
        href={ISSUES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {t("reportIssue")}
      </a>{" "}
      {t("or")}{" "}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {t("contribute")}
      </a>{" "}
      {t("improve")}
    </p>
  );
}
