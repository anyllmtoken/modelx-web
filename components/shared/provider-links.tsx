"use client";

import { Ellipsis } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProviderLinks({
  url,
  docsUrl,
  pricingUrl,
  statusUrl,
  changelogUrl,
  playgroundUrl,
  tokenizerUrl,
  sdk,
  githubUrl,
  blogUrl,
  twitterUrl,
  discordUrl,
  termsUrl,
  supportUrl,
}: {
  url: string;
  docsUrl: string;
  pricingUrl: string | null | undefined;
  statusUrl?: string;
  changelogUrl?: string;
  playgroundUrl?: string;
  tokenizerUrl?: string;
  sdk?: Record<string, string>;
  githubUrl?: string;
  blogUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  termsUrl?: string;
  supportUrl?: string;
}) {
  const t = useTranslations("Provider");
  const hasExtras = statusUrl || changelogUrl || playgroundUrl || tokenizerUrl;
  const hasSocial = githubUrl || blogUrl || twitterUrl || discordUrl;
  const sdkEntries = sdk ? Object.entries(sdk) : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Ellipsis size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          render={<a href={url} target="_blank" rel="noopener noreferrer" />}
        >
          {t("website")}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a href={docsUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          {t("docs")}
        </DropdownMenuItem>
        {pricingUrl && (
        <DropdownMenuItem
          render={
            <a href={pricingUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          {t("pricing")}
        </DropdownMenuItem>
        )}
        {playgroundUrl && (
          <DropdownMenuItem
            render={
              <a
                href={playgroundUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t("playground")}
          </DropdownMenuItem>
        )}
        {hasExtras && <DropdownMenuSeparator />}
        {statusUrl && (
          <DropdownMenuItem
            render={
              <a href={statusUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            {t("status")}
          </DropdownMenuItem>
        )}
        {changelogUrl && (
          <DropdownMenuItem
            render={
              <a
                href={changelogUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t("changelog")}
          </DropdownMenuItem>
        )}
        {tokenizerUrl && (
          <DropdownMenuItem
            render={
              <a
                href={tokenizerUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t("tokenizer")}
          </DropdownMenuItem>
        )}
        {hasSocial && (
          <>
            <DropdownMenuSeparator />
            {githubUrl && (
              <DropdownMenuItem
                render={
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t("github")}
              </DropdownMenuItem>
            )}
            {blogUrl && (
              <DropdownMenuItem
                render={
                  <a href={blogUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                {t("blog")}
              </DropdownMenuItem>
            )}
            {twitterUrl && (
              <DropdownMenuItem
                render={
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t("twitter")}
              </DropdownMenuItem>
            )}
            {discordUrl && (
              <DropdownMenuItem
                render={
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t("discord")}
              </DropdownMenuItem>
            )}
          </>
        )}
        {(termsUrl || supportUrl) && (
          <>
            <DropdownMenuSeparator />
            {supportUrl && (
              <DropdownMenuItem
                render={
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t("support")}
              </DropdownMenuItem>
            )}
            {termsUrl && (
              <DropdownMenuItem
                render={
                  <a
                    href={termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t("termsOfService")}
              </DropdownMenuItem>
            )}
          </>
        )}
        {sdkEntries.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>SDK</DropdownMenuLabel>
            {sdkEntries.map(([lang, pkg]) => (
              <DropdownMenuItem
                key={lang}
                render={
                  <a
                    href={
                      lang === "python"
                        ? `https://pypi.org/project/${pkg}`
                        : `https://www.npmjs.com/package/${pkg}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <span className="capitalize">{lang}</span>
                <span className="text-muted-foreground ml-auto pl-4 font-mono text-xs">
                  {pkg}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
