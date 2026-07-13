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
  // 彩色 SVG 有自己的 fill 色值，不需要外层着色；单色 SVG（fill="currentColor"）用前景色
  const isMonochrome = clean.includes('fill="currentColor"') || !clean.includes('fill="#');
  return (
    <span
      className={`shrink-0 ${isMonochrome ? "text-foreground" : ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
