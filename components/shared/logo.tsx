export function Logo({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src="/icon0.svg"
      alt="ModelX"
      className={className}
      width={size}
      height={size}
    />
  );
}
