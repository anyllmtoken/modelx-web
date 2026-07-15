import { NextRequest, NextResponse } from "next/server";
import { providers, getModel, getModelsByProvider } from "@/lib/data";
import type { Model } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const providerId = searchParams.get("provider");
  const modelId = searchParams.get("model");

  let models: Model[];
  let filename: string;

  if (modelId && providerId) {
    const m = getModel(providerId, modelId);
    models = m ? [m] : [];
    filename = `modelx-${providerId}-${modelId}`;
  } else if (providerId) {
    models = getModelsByProvider(providerId);
    filename = `modelx-${providerId}`;
  } else {
    models = providers.flatMap((p) =>
      p.models.map((m) => ({ ...m, provider: p.id })),
    );
    filename = "modelx-models";
  }

  if (format === "csv") {
    return csvResponse(models, filename);
  }

  return NextResponse.json(models, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}.json"`,
    },
  });
}

function csvResponse(models: Model[], filename: string): NextResponse {
  const headers = [
    "provider",
    "id",
    "name",
    "created_by",
    "model_type",
    "context_window",
    "max_output_tokens",
    "pricing_input",
    "pricing_output",
    "status",
    "release_date",
  ];

  const rows = models.map((m) =>
    headers.map((h) => {
      switch (h) {
        case "provider":
          return m.provider;
        case "pricing_input":
          return m.pricing?.input ?? "";
        case "pricing_output":
          return m.pricing?.output ?? "";
        default:
          return (m as Record<string, unknown>)[h] ?? "";
      }
    }),
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
