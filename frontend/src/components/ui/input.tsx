import * as React from "react";

import { cn } from "#/utils/classname";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-(--line) bg-(--surface) px-3 py-1 text-sm text-(--sea-ink) shadow-xs outline-none transition-[color,box-shadow]",
        "placeholder:text-(--sea-ink-soft)/50",
        "selection:bg-(--lagoon)/20",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-(--sea-ink)",
        "focus-visible:border-(--lagoon) focus-visible:ring-[3px] focus-visible:ring-(--lagoon)/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
