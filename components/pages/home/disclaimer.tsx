import { getTranslations } from "next-intl/server";

const linkClass =
  "underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:text-muted-foreground";

export async function Disclaimer() {
  const t = await getTranslations("Disclaimer");
  return (
    <p className="text-muted-foreground/60 text-center text-xs leading-relaxed text-pretty">
      {t("text")}{" "}
      <a
        href="https://gitee.com/fastauth/model-x/issues"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {t("reportIssue")}
      </a>{" "}
      {t("or")}{" "}
      <a
        href="https://gitee.com/fastauth/model-x"
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
