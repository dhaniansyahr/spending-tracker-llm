import * as React from "react";
import { Select } from "radix-ui";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "#/utils/classname";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

type SingleSelectProps = {
  options: SelectOption[] | SelectGroup[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
};

function isGrouped(
  options: SelectOption[] | SelectGroup[],
): options is SelectGroup[] {
  return options.length > 0 && "options" in options[0]!;
}

function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
}: SingleSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        data-slot="single-select-trigger"
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--sea-ink) shadow-xs outline-none transition-[color,box-shadow]",
          "data-[placeholder]:text-(--sea-ink-soft)/50",
          "focus:border-(--lagoon) focus:ring-[3px] focus:ring-(--lagoon)/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>span]:truncate",
          triggerClassName,
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDownIcon className="size-4 shrink-0 text-(--sea-ink-soft)/60" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          data-slot="single-select-content"
          position="popper"
          sideOffset={6}
          className={cn(
            "relative z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl",
            "border border-(--line)",
            "bg-(--surface-strong) backdrop-blur-md",
            "text-(--sea-ink)",
            "shadow-[0_8px_24px_rgba(30,90,72,0.12),0_1px_0_var(--inset-glint)_inset]",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
            className,
          )}
        >
          <Select.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-(--sea-ink-soft)">
            <ChevronUpIcon className="size-4" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {isGrouped(options)
              ? options.map((group) => (
                  <Select.Group key={group.label}>
                    <Select.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)/70">
                      {group.label}
                    </Select.Label>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.value} option={opt} />
                    ))}
                  </Select.Group>
                ))
              : (options as SelectOption[]).map((opt) => (
                  <SelectItem key={opt.value} option={opt} />
                ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-(--sea-ink-soft)">
            <ChevronDownIcon className="size-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function SelectItem({ option }: { option: SelectOption }) {
  return (
    <Select.Item
      value={option.value}
      disabled={option.disabled}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
        "focus:bg-(--lagoon)/10 focus:text-(--sea-ink)",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[state=checked]:font-medium",
      )}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center text-(--lagoon)">
        <Select.ItemIndicator>
          <CheckIcon className="size-3.5" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{option.label}</Select.ItemText>
    </Select.Item>
  );
}

export { SingleSelect };
