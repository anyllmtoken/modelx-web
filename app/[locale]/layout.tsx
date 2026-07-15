import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { providers } from "@/lib/data";
import { Provider } from "./provider";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const commandPaletteData = {
    providers: providers.map((p) => ({
      type: "provider" as const,
      id: `prov-${p.id}`,
      name: p.name,
      href: `/${p.id}`,
      sub: `${p.models.length} models`,
      icon: p.icon,
    })),
  };

  return (
    <Provider>
      <div className="bg-background relative flex min-h-screen flex-col">
        <Header commandPaletteData={commandPaletteData} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Provider>
  );
}
