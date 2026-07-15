function sanitizeSvg(html: string): string {
  return html.match(/<svg[\s\S]*<\/svg>/i)?.[0] ?? "";
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
