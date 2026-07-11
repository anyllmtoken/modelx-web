"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProviderMap } from "@/components/pages/analytics/provider-map";
import { DetailPanel } from "@/components/pages/analytics/detail-panel";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { AnalyticsData, Selection } from "@/lib/analytics";

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

export function HomeMapSection({ data }: { data: AnalyticsData }) {
  const t = useTranslations("Home");
  const [selection, setSelection] = useState<Selection | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapHeight, setMapHeight] = useState(0);
  const isXl = useIsXl();

  // Measure map height when selection opens and on resize
  useEffect(() => {
    if (!selection || !mapRef.current) return;
    function measure() {
      if (mapRef.current) {
        setMapHeight(mapRef.current.offsetHeight);
      }
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

  return (
    <section className="pb-14 max-md:pb-10">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-foreground text-[24px] font-bold tracking-tight max-md:text-[20px]">
            {t("providerDistribution")}
          </h2>
          <Link
            href="/analytics"
            className="text-muted-foreground hover:text-primary flex items-center gap-1 text-[13px] no-underline transition-colors"
          >
            {t("viewAllAnalysis")}
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex items-start gap-6">
          <div ref={mapRef} className="min-w-0 flex-1">
            <ProviderMap
              data={data.providerGeo}
              onSelect={setSelection}
              selection={selection}
            />
          </div>

          {/* Desktop: panel constrained to map height */}
          {selection && mapHeight > 0 && (
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
      </div>

      {/* Mobile: bottom drawer */}
      <Drawer
        open={!isXl && selection !== null}
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
    </section>
  );
}
