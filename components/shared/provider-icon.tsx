function sanitizeSvg(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html.match(/<svg[\s\S]*<\/svg>/i)?.[0] ?? "";
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return "";
  svg.querySelectorAll("script").forEach((el) => el.remove());
  svg.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    }
  });
  return svg.outerHTML;
}

export function ProviderIcon({
  provider,
  size = 16,
}: {
  provider: { icon?: string } | null | undefined;
  size?: number;
}) {
  if (!provider?.icon) return null;
  const clean = sanitizeSvg(provider.icon);
  if (!clean) return null;
  const svg = clean.replace("<svg ", `<svg width="${size}" height="${size}" `);
  return (
    <span
      className="text-muted-foreground shrink-0"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
