import { getTranslations } from "next-intl/server";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";

export default async function ProviderNotFound() {
  const tn = await getTranslations("NotFound");
  const tp = await getTranslations("Provider");
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <h1 className="text-foreground font-mono text-6xl font-medium">404</h1>
      <p className="text-muted-foreground mt-3 text-balance">
        {tp("notSupported")}
      </p>
      <p className="text-muted-foreground mt-2 max-w-md text-sm text-pretty">
        {tp("notSupportedDesc")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/">{tn("backToHome")}</ButtonLink>
        <ButtonAnchor
          href="https://gitee.com/fastauth/model-x/issues/new?title=Add+provider:+&labels=new-provider"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tp("requestProvider")}
        </ButtonAnchor>
        <ButtonAnchor
          href="https://gitee.com/fastauth/model-x/issues/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tn("helpUsImprove")}
        </ButtonAnchor>
      </div>
    </div>
  );
}
