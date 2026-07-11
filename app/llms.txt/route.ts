import { SITE_URL, API_URL } from "@/lib/config";
import { allModels, providers } from "@/lib/data";

export const revalidate = 86400;

export async function GET() {
  const activeModels = allModels.filter(
    (m) => m.status !== "deprecated" && !m.alias,
  );
  const families = new Set(allModels.map((m) => m.family).filter(Boolean));

  const topProviders = providers
    .filter((p) => p.type === "direct")
    .sort((a, b) => b.models.length - a.models.length)
    .slice(0, 20);

  const lines = [
    "# ModelX — AI Model Catalog",
    "",
    "> Open catalog of AI models across 30+ providers. Browse, compare, and search 4000+ models with specs, pricing, and capabilities.",
    "",
    "## Site URLs",
    "",
    `- Homepage: ${SITE_URL}/`,
    `- All models: ${SITE_URL}/models`,
    `- Providers: ${SITE_URL}/providers`,
    `- Compare: ${SITE_URL}/compare`,
    `- Analytics: ${SITE_URL}/analytics`,
    `- Changelog: ${SITE_URL}/changes`,
    `- API docs: ${SITE_URL}/docs/api`,
    `- English: ${SITE_URL}/en`,
    "",
    "## API",
    "",
    `REST API base: ${API_URL}/v1`,
    `- GET /v1/models — list all models`,
    `- GET /v1/models/:provider/:id — model details`,
    `- GET /v1/providers — list all providers`,
    `- GET /v1/providers/:id — provider details`,
    `- GET /v1/models/search?q=... — search models`,
    "- No authentication required. CORS enabled. Rate limit: 60 req/min per IP.",
    "",
    "Machine-readable Markdown API:",
    `- ${API_URL}/markdown/ — all models as Markdown`,
    `- ${API_URL}/markdown/models — model list`,
    `- ${API_URL}/markdown/providers — provider list`,
    "",
    "## Stats",
    "",
    `- Total models: ${allModels.length}`,
    `- Active models: ${activeModels.length}`,
    `- Providers: ${providers.length}`,
    `- Model families: ${families.size}`,
    "",
    "## Top Providers",
    "",
    ...topProviders.map(
      (p) => `- ${p.name}: ${SITE_URL}/${p.id} (${p.models.length} models)`,
    ),
    "",
    "## Data",
    "",
    "- Data is sourced from official provider APIs and public documentation.",
    "- Updated daily via automated fetch scripts.",
    "- Pricing is in USD per 1M tokens.",
    "- Model specs include context window, max output, capabilities, modalities, and performance ratings.",
    "",
    "## Languages",
    "",
    "- Chinese (default): /",
    "- English: /en/",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
