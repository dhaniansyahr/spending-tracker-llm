import * as React from "react";
import { CATEGORY_LABELS } from "#/components/ui/badge";
import { Input } from "#/components/ui/input";
import { SingleSelect } from "#/components/shared/single-select";
import type { SelectOption } from "#/components/shared/single-select";
import type { TCategory, TSpending } from "#/services/spendings/type";
import type { TLLMSpendingOutput } from "#/services/spendings";
import { DatePicker } from "#/components/shared/date-picker";

export type SpendingFormState = {
  title: string;
  amount: string;
  category: string;
  note: string;
  date: string;
};

export const initialFormState: SpendingFormState = {
  title: "",
  amount: "",
  category: "",
  note: "",
  date: "",
};

export type IdDialogHandle = {
  open: (id: string) => void;
  close: () => void;
};

export function fromSpending(s: TSpending): SpendingFormState {
  return {
    title: s.title,
    amount: String(s.amount),
    category: s.category,
    note: s.note ?? "",
    date: s.date ?? "",
  };
}

export function fromLLMOutput(o: TLLMSpendingOutput): SpendingFormState {
  return {
    title: o.title,
    amount: String(o.amount),
    category: o.category,
    note: o.note ?? "",
    date: o.date ?? "",
  };
}

const CATEGORY_OPTIONS: SelectOption[] = (
  Object.entries(CATEGORY_LABELS) as [TCategory, string][]
).map(([value, label]) => ({ value, label }));

type SpendingFormFieldsProps = {
  form: SpendingFormState;
  errors: Record<string, string>;
  onChange: (field: keyof SpendingFormState, value: string) => void;
  disabled?: boolean;
};

export function SpendingFormFields({
  form,
  errors,
  onChange,
  disabled,
}: SpendingFormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--sea-ink)">Title</label>
        <Input
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Coffee at Starbucks"
          disabled={disabled}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--sea-ink)">
          Amount{" "}
          <span className="font-normal text-(--sea-ink-soft)">(IDR)</span>
        </label>
        <Input
          type="number"
          min="0"
          value={form.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          placeholder="e.g. 50000"
          disabled={disabled}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--sea-ink)">Category</label>
        <SingleSelect
          placeholder="Select category"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(val) => onChange("category", val)}
          disabled={disabled}
        />
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--sea-ink)">
          Date{" "}
          <span className="font-normal text-(--sea-ink-soft)">(optional)</span>
        </label>
        <DatePicker
          value={form.date ? new Date(form.date) : undefined}
          onChange={(date) => onChange("date", date ? date.toISOString() : "")}
          disabled={disabled}
          placeholder="Select Date"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--sea-ink)">
          Note{" "}
          <span className="font-normal text-(--sea-ink-soft)">(optional)</span>
        </label>
        <textarea
          value={form.note}
          onChange={(e) => onChange("note", e.target.value)}
          placeholder="Add a note..."
          rows={3}
          disabled={disabled}
          className="flex min-h-[80px] w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--sea-ink) shadow-xs outline-none transition-[color,box-shadow] placeholder:text-(--sea-ink-soft)/50 focus:border-(--lagoon) focus:ring-[3px] focus:ring-(--lagoon)/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {errors.note && (
          <p className="text-xs text-destructive">{errors.note}</p>
        )}
      </div>
    </div>
  );
}
