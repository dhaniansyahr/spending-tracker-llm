import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanIcon } from "lucide-react";
import { Modal, type ModalHandle } from "#/components/shared/modal";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { services } from "#/services";
import { schemaSpending, schemaAnalyzeReceipt } from "#/services/spendings/type";
import {
  SpendingFormFields,
  initialFormState,
  fromLLMOutput,
  type SpendingFormState,
} from "./spending-form";

const DialogCreateReceipt = React.forwardRef<ModalHandle, {}>((_, outerRef) => {
  const modalRef = React.useRef<ModalHandle>(null);
  const [step, setStep] = React.useState<"input" | "confirm">("input");
  const [receiptUrl, setReceiptUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState("");
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
    setReceiptUrl("");
    setUrlError("");
    setForm(initialFormState);
    setErrors({});
  }, []);

  const analyzeMutation = useMutation({
    ...services.spending.analyzeReceipt(),
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
    const result = schemaAnalyzeReceipt.safeParse({ receiptUrl });
    if (!result.success) {
      setUrlError(result.error.issues[0]?.message ?? "Invalid URL.");
      return;
    }
    setUrlError("");
    analyzeMutation.mutate(result.data);
  }, [receiptUrl, analyzeMutation]);

  const handleSave = React.useCallback(() => {
    const result = schemaSpending.safeParse({
      title: form.title,
      amount: Number(form.amount),
      category: form.category || undefined,
      source: "RECEIPT",
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
      title={step === "input" ? "Receipt Analysis" : "Confirm Spending"}
      description={
        step === "input"
          ? "Provide a receipt URL and the AI will extract the details."
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
                  <ScanIcon className="size-4" />
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
            Receipt URL
          </label>
          <Input
            type="url"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="https://example.com/receipt.jpg"
            disabled={isAnalyzing}
          />
          {urlError && (
            <p className="text-xs text-destructive">{urlError}</p>
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

DialogCreateReceipt.displayName = "DialogCreateReceipt";

export { DialogCreateReceipt };
