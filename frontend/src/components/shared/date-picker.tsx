import * as React from "react";
import { Popover } from "radix-ui";
import { CalendarIcon, XIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "#/utils/classname";
import { Calendar } from "#/components/ui/calendar.tsx";

const triggerBase = cn(
  "flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-(--line) bg-(--surface) px-3 text-left text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "hover:border-(--lagoon)/40 hover:bg-(--lagoon)/5",
  "focus-visible:border-(--lagoon) focus-visible:ring-[3px] focus-visible:ring-(--lagoon)/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const popoverContent = cn(
  "z-50 rounded-xl border border-(--line) p-0",
  "bg-(--surface-strong) backdrop-blur-md",
  "shadow-[0_8px_24px_rgba(30,90,72,0.12),0_1px_0_var(--inset-glint)_inset]",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
);

// ── Single date picker ──────────────────────────────────────────────────────

type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(triggerBase, !value && "text-(--sea-ink-soft)/60", className)}
        >
          <CalendarIcon className="size-4 shrink-0 text-(--sea-ink-soft)/60" />
          <span className="flex-1 truncate text-(--sea-ink)">
            {value ? format(value, "PPP") : (
              <span className="text-(--sea-ink-soft)/60">{placeholder}</span>
            )}
          </span>
          {value && (
            <span
              role="button"
              aria-label="Clear date"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }}
              className="ml-auto rounded-md p-0.5 text-(--sea-ink-soft)/60 transition-colors hover:bg-(--lagoon)/10 hover:text-(--sea-ink)"
            >
              <XIcon className="size-3.5" />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="date-picker-content"
          align="start"
          sideOffset={6}
          className={popoverContent}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(day) => {
              onChange?.(day);
              setOpen(false);
            }}
            autoFocus
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ── Date range picker ───────────────────────────────────────────────────────

type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = React.useMemo(() => {
    if (!value?.from) return null;
    if (!value.to) return format(value.from, "PPP");
    return `${format(value.from, "PPP")} – ${format(value.to, "PPP")}`;
  }, [value]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(triggerBase, !label && "text-(--sea-ink-soft)/60", className)}
        >
          <CalendarIcon className="size-4 shrink-0 text-(--sea-ink-soft)/60" />
          <span className="flex-1 truncate">
            {label ?? <span className="text-(--sea-ink-soft)/60">{placeholder}</span>}
          </span>
          {label && (
            <span
              role="button"
              aria-label="Clear date range"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }}
              className="ml-auto rounded-md p-0.5 text-(--sea-ink-soft)/60 transition-colors hover:bg-(--lagoon)/10 hover:text-(--sea-ink)"
            >
              <XIcon className="size-3.5" />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="date-range-picker-content"
          align="start"
          sideOffset={6}
          className={popoverContent}
        >
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            autoFocus
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { DatePicker, DateRangePicker };
