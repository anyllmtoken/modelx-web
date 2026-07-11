export function StatsGrid({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="flex items-center justify-center gap-12">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-foreground font-mono text-2xl font-bold tracking-tight">
            {item.value.toLocaleString()}
          </div>
          <div className="text-muted-foreground mt-1 text-sm">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
