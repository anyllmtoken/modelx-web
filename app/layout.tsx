import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SITE_URL, API_URL } from "@/lib/config";
import { ClientScriptInjector } from "@/components/shared/client-script-injector";
import Script from "next/script";
import { cn } from "@/lib/cn";
import { geistMono, geistSans } from "@/styles/font";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s — ModelX",
    default: "ModelX — Open catalog of AI models",
  },
  description:
    "Browse, compare, and search 4000+ AI models across 30+ providers. Specs, pricing, capabilities, and a free API.",
  keywords: [
    "AI models",
    "LLM",
    "model comparison",
    "OpenAI",
    "Anthropic",
    "Google",
    "GPT",
    "Claude",
    "Gemini",
    "pricing",
  ],
  icons: { icon: "/icon.svg" },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "ModelX",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ModelX",
  },
  alternates: {
    canonical: "/",
    languages: {
      zh: "/",
      en: "/en",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": "/changes/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(geistSans.className, geistMono.variable, "font-sans")}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="bg-background text-foreground min-h-screen text-sm">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_BAIDU_ANALYTICS && (
          <Script
            id="baidu-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement("script");
                  hm.src = "https://hm.baidu.com/hm.js?${process.env.NEXT_PUBLIC_BAIDU_ANALYTICS}";
                  var s = document.getElementsByTagName("script")[0];
                  s.parentNode.insertBefore(hm, s);
                })();
              `,
            }}
          />
        )}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=document.documentElement;var t=localStorage.getItem("theme");var r=t?t==="dark":window.matchMedia("(prefers-color-scheme:dark)").matches;if(r){e.classList.add("dark")}else{e.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
        <ClientScriptInjector
          id="schema-org"
          content={JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ModelX",
            url: SITE_URL,
            description:
              "Open catalog of AI model data — specs, pricing, and capabilities across 30+ providers and 4000+ models.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/models?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          })}
        />
      </body>
    </html>
  );
}
