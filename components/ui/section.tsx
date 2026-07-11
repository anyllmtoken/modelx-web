export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2
        id={id}
        className="text-foreground mb-7 text-[28px] font-bold tracking-tight max-md:text-[22px]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
