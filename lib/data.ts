import type { Model, ProviderWithModels, ChangeEntry } from "@anyllmtoken/modelx-data";
import {
  getModels as _getModels,
  getModel as _getModel,
  getProvider as _getProvider,
  getProviders as _getProviders,
  getActiveModels,
  getAllProviders,
  getChanges,
  getModelsByCreator,
  getModelsByFamily,
  getModelsByProvider,
} from "@anyllmtoken/modelx-data";
import { normalizeModelId } from "./search";

export type {
  ChangeEntry,
  Model,
  ModelCapabilities,
  ModelData,
  ModelPricing,
  Provider,
  ProviderWithModels,
} from "@anyllmtoken/modelx-data";

// ── Export combined data (unfiltered) ──

export const allModels: Model[] = _getModels();
export const providers: ProviderWithModels[] = _getProviders();

// ── Locale-aware selectors ──
// zh → prefer CN region; en/others → prefer US

export function regionForLocale(locale: string): string {
  return locale === "zh" ? "CN" : "US";
}

export function getModelsByLocale(locale: string): Model[] {
  const region = regionForLocale(locale);
  return _getModels().filter((m) => (m as any).region === region);
}

export function getProvidersByLocale(locale: string): ProviderWithModels[] {
  const region = regionForLocale(locale);
  const all = getAllProviders().map((p) => ({
    ...p,
    models: p.models.filter((m) => (m as any).region === region),
  }));
  return all.filter((p) => p.models.length > 0);
}

export function getProviderByLocale(
  id: string,
  locale: string,
): ProviderWithModels | undefined {
  const p = getAllProviders().find((p) => p.id === id);
  if (!p) return undefined;
  const region = regionForLocale(locale);
  const filtered = p.models.filter((m) => (m as any).region === region);
  return { ...p, models: filtered };
}

// ── Original selectors (keep for backwards compat) ──

export function getModel(provider: string, id: string): Model | undefined {
  const decoded = decodeURIComponent(id);
  return (
    _getModel(provider, decoded) ??
    allModels.find(
      (m) => m.provider === provider && m.snapshots?.includes(decoded),
    )
  );
}
export const getProvider = _getProvider;
export {
  getActiveModels,
  getAllProviders,
  getModelsByCreator,
  getModelsByFamily,
  getModelsByProvider,
};

// ── Inheritance ──

const INHERITABLE_FIELDS = [
  "description",
  "status",
  "context_window",
  "max_output_tokens",
  "max_input_tokens",
  "pricing",
  "performance",
  "reasoning",
  "speed",
  "knowledge_cutoff",
  "release_date",
  "deprecation_date",
  "model_type",
  "reasoning_tokens",
  "license",
  "parameters",
  "active_parameters",
] as const;

export interface EnrichedModel extends Model {
  inheritedFields?: Set<string>;
  inheritedFrom?: string;
}

function inheritFields(
  enriched: EnrichedModel,
  source: Model,
  inherited: Set<string>,
): void {
  const target = enriched as Record<string, unknown>;
  const src = source as Record<string, unknown>;
  for (const field of INHERITABLE_FIELDS) {
    if (target[field] == null && src[field] != null) {
      target[field] = src[field];
      inherited.add(field);
    }
  }
  if (source.capabilities) {
    const caps: Record<string, boolean> = { ...enriched.capabilities };
    for (const [key, val] of Object.entries(source.capabilities)) {
      if (caps[key] == null && val != null) {
        caps[key] = val;
        inherited.add(`capabilities.${key}`);
      }
    }
    enriched.capabilities = caps;
  }
  if (!enriched.modalities && source.modalities) {
    enriched.modalities = source.modalities;
    inherited.add("modalities");
  }
}

export function getModelWithInheritance(
  provider: string,
  id: string,
): EnrichedModel | undefined {
  const model = getModel(provider, id);
  if (!model) return undefined;

  const enriched: EnrichedModel = { ...model };
  const inherited = new Set<string>();

  if (model.alias) {
    const alias = _getModel(model.provider, model.alias);
    if (alias) {
      inheritFields(enriched, alias, inherited);
    }
  }

  if (model.created_by !== model.provider) {
    const canonical =
      _getModel(model.created_by, model.id) ??
      _getModel(model.created_by, model.name) ??
      allModels.find(
        (m) =>
          m.provider === model.created_by &&
          (normalizeModelId(m.id) === normalizeModelId(model.id) ||
            normalizeModelId(m.id) === normalizeModelId(model.name)),
      );
    if (canonical) {
      inheritFields(enriched, canonical, inherited);
    }
  }

  if (inherited.size > 0) {
    enriched.inheritedFields = inherited;
    enriched.inheritedFrom = model.alias
      ? model.alias
      : (_getProvider(model.created_by)?.name ?? model.created_by);
  }

  return enriched;
}

export { getChanges };
