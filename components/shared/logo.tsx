export function Logo({
  className,
  size = 24,
  color,
  src,
}: {
  className?: string;
  size?: number;
  color?: string;
  src?: string;
}) {
  return (
    <img
      src={src ?? "/icon0.svg"}
      alt="ModelX"
      className={className}
      width={size}
      height={size}
      style={color ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}
