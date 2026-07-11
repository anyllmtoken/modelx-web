"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTranslations } from "next-intl";
import { CapabilityHeatmap } from "@/components/pages/analytics/capability-heatmap";
import { ContextDistributionChart } from "@/components/pages/analytics/context-distribution";
import { ContextTimeline } from "@/components/pages/analytics/context-timeline";
import { DetailPanel } from "@/components/pages/analytics/detail-panel";
import { LicenseChart } from "@/components/pages/analytics/license-chart";
import { ModalityChart } from "@/components/pages/analytics/modality-chart";
import { ModelTypeChart } from "@/components/pages/analytics/model-type-chart";
import { OpenWeightTrend } from "@/components/pages/analytics/open-weight-trend";
import { ParamsTrend as ParamsTrendChart } from "@/components/pages/analytics/params-trend";
import { PriceDistribution } from "@/components/pages/analytics/price-distribution";
import { PriceVsIntelligence } from "@/components/pages/analytics/price-vs-intelligence";
import { PricingTrend as PricingTrendChart } from "@/components/pages/analytics/pricing-trend";
import { ProviderMap } from "@/components/pages/analytics/provider-map";
import { ProviderRankingChart } from "@/components/pages/analytics/provider-ranking";
import { ReleaseTimeline } from "@/components/pages/analytics/release-timeline";
import { TopFamiliesChart } from "@/components/pages/analytics/top-families";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Section } from "@/components/ui/section";
import type { AnalyticsData, Selection } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const XL = "(min-width: 1280px)";
function useIsXl() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia(XL);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(XL).matches,
    () => false,
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const t = useTranslations("Analytics");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [visible, setVisible] = useState(false);
  const [mapHeight, setMapHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const isXl = useIsXl();

  // Measure map height when selection changes
  useEffect(() => {
    if (!selection || !mapRef.current) return;
    function measure() {
      if (mapRef.current) setMapHeight(mapRef.current.offsetHeight);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(mapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selection]);

  useEffect(() => {
    if (selection) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [selection]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => setSelection(null), 200);
  }

  return (
    <div>
      <Section title={t("providerDistribution")}>
        <div className="flex items-start gap-6">
          <div ref={mapRef} className="min-w-0 flex-1">
            <ProviderMap
              data={data.providerGeo}
              onSelect={setSelection}
              selection={selection}
            />
          </div>
          {selection && (
            <div
              className="hidden w-72 shrink-0 overflow-y-auto xl:block"
              style={{ maxHeight: mapHeight }}
            >
              <DetailPanel
                selection={selection}
                models={data.models}
                onClose={() => setSelection(null)}
              />
            </div>
          )}
        </div>
      </Section>

      <Section title={t("priceVsIntelligence")}>
        <PriceVsIntelligence
          data={data.priceVsIntelligence}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("modelReleases")}>
        <ReleaseTimeline
          data={data.releaseTimeline}
          onSelect={setSelection}
          selection={selection}
          summary={data.releaseSummary}
        />
      </Section>

      <Section title={t("contextWindowEvolution")}>
        <ContextTimeline
          data={data.contextTimeline}
          onSelect={setSelection}
          selection={selection}
          summary={data.contextSummary}
        />
      </Section>

      <Section title={t("capabilityCoverage")}>
        <CapabilityHeatmap
          data={data.capabilityHeatmap}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("pricingDistribution")}>
        <PriceDistribution
          data={data.priceDistribution}
          onSelect={setSelection}
          selection={selection}
          summary={data.priceSummary}
        />
      </Section>

      <Section title={t("openWeightVsProprietary")}>
        <OpenWeightTrend
          data={data.openWeightTrend}
          onSelect={setSelection}
          selection={selection}
          summary={data.openWeightSummary}
        />
      </Section>

      <Section title={t("modelTypeDistribution")}>
        <ModelTypeChart
          data={data.modelTypeDistribution}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("parametersOverTime")}>
        <ParamsTrendChart
          data={data.paramsTrend}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("pricingTrend")}>
        <PricingTrendChart
          data={data.pricingTrend}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("licenseDistribution")}>
        <LicenseChart
          data={data.licenseDistribution}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("topModelFamilies")}>
        <TopFamiliesChart
          data={data.topFamilies}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("providerModelCount")}>
        <ProviderRankingChart
          data={data.providerRanking}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("contextWindowDistribution")}>
        <ContextDistributionChart
          data={data.contextDistribution}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      <Section title={t("modalityCoverage")}>
        <ModalityChart
          data={data.modalityCoverage}
          onSelect={setSelection}
          selection={selection}
        />
      </Section>

      {/* Desktop: fixed panel for non-map charts */}
      {selection && selection.type !== "region" && (
        <div
          ref={panelRef}
          className={cn(
            "fixed top-[13.125rem] z-30 hidden w-72 transition-all duration-200 xl:block",
            visible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0",
          )}
          style={{ left: "calc(50% + 25rem)" }}
        >
          <div className="sticky top-24">
            <DetailPanel
              selection={selection}
              models={data.models}
              onClose={handleClose}
            />
          </div>
        </div>
      )}

      {/* Mobile: bottom drawer for non-map charts */}
      <Drawer
        open={!isXl && selection !== null && selection.type !== "region"}
        onOpenChange={(open) => {
          if (!open) setSelection(null);
        }}
      >
        <DrawerContent>
          {selection && (
            <DetailPanel
              selection={selection}
              models={data.models}
              onClose={() => setSelection(null)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
