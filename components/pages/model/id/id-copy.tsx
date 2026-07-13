"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CopyGroup {
  label: string;
  items: { label: string; value: string }[];
}

export function ModelIdCopy({ groups }: { groups: CopyGroup[] }) {
  function copy(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      toast(`Copied: ${value}`);
    });
  }

  const nonEmpty = groups.filter((g) => g.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon-sm" aria-label="Copy model ID" />}
      >
        <Copy size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="![--anchor-width:50vw] max-w-96">
        {nonEmpty.map((group, gi) => (
          <DropdownMenuGroup key={group.label}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => copy(item.value)}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-foreground truncate font-mono text-xs">
                    {item.value}
                  </span>
                  {item.label !== item.value && (
                    <span className="text-muted-foreground truncate text-[11px]">
                      {item.label}
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
