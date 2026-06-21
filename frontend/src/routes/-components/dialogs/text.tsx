import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { Modal, type ModalHandle } from "#/components/shared/modal";
import { Button } from "#/components/ui/button";
import { services } from "#/services";
import { schemaSpending, schemaAnalyzeText } from "#/services/spendings/type";
import {
  SpendingFormFields,
  initialFormState,
  fromLLMOutput,
  type SpendingFormState,
} from "./spending-form";

const DialogCreateText = React.forwardRef<ModalHandle, {}>((_, outerRef) => {
  const modalRef = React.useRef<ModalHandle>(null);
  const [step, setStep] = React.useState<"input" | "confirm">("input");
  const [text, setText] = React.useState("");
  const [textError, setTextError] = React.useState("");
  const [form, setForm] = React.useState<SpendingFormState>(initialFormState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  React.useImperativeHandle(outerRef, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
    isOpen: () => modalRef.current?.isOpen() ?? false,
  }));

  const resetDialog = React.useCallback(() => {
    setStep("input");
    setText("");
    setTextError("");
    setForm(initialFormState);
    setErrors({});
  }, []);

  const analyzeMutation = useMutation({
    ...services.spending.analyzeText(),
    onSuccess: (data) => {
      setForm(fromLLMOutput(data));
      setStep("confirm");
    },
  });

  const createMutation = useMutation({
    ...services.spending.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      modalRef.current?.close();
    },
  });

  const handleAnalyze = React.useCallback(() => {
    const result = schemaAnalyzeText.safeParse({ text });
    if (!result.success) {
      setTextError(result.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setTextError("");
    analyzeMutation.mutate(result.data);
  }, [text, analyzeMutation]);

  const handleSave = React.useCallback(() => {
    const result = schemaSpending.safeParse({
      title: form.title,
      amount: Number(form.amount),
      category: form.category || undefined,
      source: "FREE_TEXT",
      note: form.note || undefined,
      date: form.date ? new Date(form.date).toISOString() : undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    createMutation.mutate(result.data);
  }, [form, createMutation]);

  const handleChange = React.useCallback(
    (field: keyof SpendingFormState, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const isAnalyzing = analyzeMutation.isPending;
  const isSaving = createMutation.isPending;

  return (
    <Modal
      ref={modalRef}
      title={step === "input" ? "Text Analysis" : "Confirm Spending"}
      description={
        step === "input"
          ? "Describe your spending — the AI will extract the details."
          : "Review and adjust the extracted details before saving."
      }
      onOpenChange={(open) => {
        if (!open) resetDialog();
      }}
      footer={
        step === "input" ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => modalRef.current?.close()}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <SparklesIcon className="size-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => setStep("input")}
              disabled={isSaving}
            >
              ← Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => modalRef.current?.close()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )
      }
    >
      {step === "input" ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-(--sea-ink)">
            Spending description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Bought coffee and croissant at Starbucks for 50000"
            rows={5}
            disabled={isAnalyzing}
            className="flex min-h-[100px] w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--sea-ink) shadow-xs outline-none transition-[color,box-shadow] placeholder:text-(--sea-ink-soft)/50 focus:border-(--lagoon) focus:ring-[3px] focus:ring-(--lagoon)/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          {textError && (
            <p className="text-xs text-destructive">{textError}</p>
          )}
          {analyzeMutation.isError && (
            <p className="text-xs text-destructive">
              Analysis failed. Please try again.
            </p>
          )}
        </div>
      ) : (
        <SpendingFormFields
          form={form}
          errors={errors}
          onChange={handleChange}
          disabled={isSaving}
        />
      )}
    </Modal>
  );
});

DialogCreateText.displayName = "DialogCreateText";

export { DialogCreateText };
