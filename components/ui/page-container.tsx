export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-[1200px] px-4 py-12 sm:px-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
