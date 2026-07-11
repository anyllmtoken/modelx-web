import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  count,
  sub,
  icon,
  trailing,
  className,
}: {
  title: string;
  count?: number;
  sub?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 pt-6 text-center", className)}>
      <h1 className="text-foreground inline-flex items-center gap-2.5 text-[28px] font-bold tracking-tight max-md:text-[22px]">
        {icon}
        {title}
        {count != null && (
          <span className="text-muted-foreground font-normal">{count}</span>
        )}
      </h1>
      {sub && (
        <p className="text-muted-foreground mx-auto mt-2 max-w-[620px] text-base leading-relaxed">
          {sub}
        </p>
      )}
      {trailing && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {trailing}
        </div>
      )}
    </div>
  );
}
