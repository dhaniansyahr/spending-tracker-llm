import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import {
  TrendingUpIcon,
  LightbulbIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Modal, type ModalHandle } from "#/components/shared/modal";
import { Button } from "#/components/ui/button";
import { DateRangePicker } from "#/components/shared/date-picker";
import { CATEGORY_LABELS } from "#/components/ui/badge";
import { services } from "#/services";
import { formatCurrency, formatDate } from "#/utils/format";
import type { TVerdictResponse } from "#/services/analysis/type";
import type { TCategory } from "#/services/spendings/type";

// ── Result sections ──────────────────────────────────────────────────────────

function VerdictSection({ verdict }: { verdict: string }) {
  return (
    <div className="rounded-xl border border-(--line) bg-(--lagoon)/5 px-4 py-3.5">
      <p className="text-sm leading-relaxed text-(--sea-ink)">{verdict}</p>
    </div>
  );
}

function SummarySection({
  totalAmount,
  byCategory,
}: {
  totalAmount: number;
  byCategory: Record<string, number>;
}) {
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)/70">
          Total Spending
        </span>
        <span className="text-sm font-semibold text-(--sea-ink)">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          {sorted.map(([cat, amount]) => {
            const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
            const label =
              CATEGORY_LABELS[cat as TCategory] ?? cat.replace(/_/g, " ");
            return (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-(--sea-ink-soft)">{label}</span>
                  <span className="text-xs text-(--sea-ink)">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--line)">
                  <div
                    className="h-full rounded-full bg-(--lagoon)/70 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BulletList({
  title,
  items,
  icon,
}: {
  title: string;
  items: [string, string, string];
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)/70">
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5 pl-1">
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static 3-item tuple
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-(--sea-ink)"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-(--lagoon)/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VerdictResult({ data }: { data: TVerdictResponse }) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-1">
      <VerdictSection verdict={data.verdict} />
      <div className="h-px bg-(--line)" />
      <SummarySection
        totalAmount={data.totalAmount}
        byCategory={data.byCategory}
      />
      <div className="h-px bg-(--line)" />
      <BulletList
        title="Insights"
        items={data.insights}
        icon={<LightbulbIcon className="size-3.5 text-(--lagoon)" />}
      />
      <BulletList
        title="Recommendations"
        items={data.recommendations}
        icon={<CheckCircle2Icon className="size-3.5 text-(--lagoon)" />}
      />
    </div>
  );
}

// ── Dialog ───────────────────────────────────────────────────────────────────

const DialogAnalysisVerdict = React.forwardRef<ModalHandle, {}>(
  (_, outerRef) => {
    const modalRef = React.useRef<ModalHandle>(null);
    const [step, setStep] = React.useState<"input" | "result">("input");
    const [range, setRange] = React.useState<DateRange | undefined>();
    const [rangeError, setRangeError] = React.useState("");

    React.useImperativeHandle(outerRef, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
      isOpen: () => modalRef.current?.isOpen() ?? false,
    }));

    const resetDialog = React.useCallback(() => {
      setStep("input");
      setRange(undefined);
      setRangeError("");
    }, []);

    const { mutate, isPending, data, isError } = useMutation({
      ...services.analysis.getVerdict(),
      onSuccess: () => setStep("result"),
    });

    const handleAnalyze = React.useCallback(() => {
      if (!range?.from || !range?.to) {
        setRangeError("Please select both a start and end date.");
        return;
      }
      setRangeError("");
      mutate({
        dateFrom: formatDate(range.from),
        dateTo: formatDate(range.to),
      });
    }, [range, mutate]);

    return (
      <Modal
        ref={modalRef}
        title="Spending Analysis"
        description={
          step === "input"
            ? "Select a date range to get an AI-powered verdict on your spending."
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) resetDialog();
        }}
        className="sm:max-w-xl"
        footer={
          step === "input" ? (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => modalRef.current?.close()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleAnalyze} disabled={isPending}>
                {isPending ? (
                  "Analyzing..."
                ) : (
                  <>
                    <TrendingUpIcon className="size-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep("input")}>
                ← New Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => modalRef.current?.close()}
              >
                Close
              </Button>
            </div>
          )
        }
      >
        {step === "input" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--sea-ink)">
              Date Range
            </label>
            <DateRangePicker
              value={range}
              onChange={setRange}
              placeholder="Select start and end date"
            />
            {rangeError && (
              <p className="text-xs text-destructive">{rangeError}</p>
            )}
            {isError && (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                <AlertCircleIcon className="size-3.5 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">
                  Analysis failed. Please try again.
                </p>
              </div>
            )}
          </div>
        ) : data ? (
          <VerdictResult data={data} />
        ) : null}
      </Modal>
    );
  },
);

DialogAnalysisVerdict.displayName = "DialogAnalysisVerdict";

export { DialogAnalysisVerdict };
