import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, ScanIcon, UploadIcon } from "lucide-react";
import { Modal, type ModalHandle } from "#/components/shared/modal";
import { Button } from "#/components/ui/button";
import { services } from "#/services";
import { schemaSpending } from "#/services/spendings/type";
import {
  SpendingFormFields,
  initialFormState,
  fromLLMOutput,
  type SpendingFormState,
} from "./spending-form";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DialogCreateReceipt = React.forwardRef<ModalHandle, {}>((_, outerRef) => {
  const modalRef = React.useRef<ModalHandle>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [step, setStep] = React.useState<"input" | "confirm">("input");
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState("");
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
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileError("");
    setForm(initialFormState);
    setErrors({});
  }, [previewUrl]);

  const uploadMutation = useMutation(services.storage.upload());

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

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      if (!ACCEPTED_TYPES.includes(selected.type)) {
        setFileError("Only JPG, PNG, and WEBP images are supported.");
        return;
      }

      setFileError("");
      setFile(selected);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selected));
    },
    [previewUrl],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (!dropped) return;

      if (!ACCEPTED_TYPES.includes(dropped.type)) {
        setFileError("Only JPG, PNG, and WEBP images are supported.");
        return;
      }

      setFileError("");
      setFile(dropped);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(dropped));
    },
    [previewUrl],
  );

  const handleAnalyze = React.useCallback(async () => {
    if (!file) {
      setFileError("Please select a receipt image.");
      return;
    }

    const uploaded = await uploadMutation.mutateAsync(file);
    analyzeMutation.mutate({ receiptUrl: uploaded.url });
  }, [file, uploadMutation, analyzeMutation]);

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

  const isUploading = uploadMutation.isPending;
  const isAnalyzing = analyzeMutation.isPending;
  const isBusy = isUploading || isAnalyzing;
  const isSaving = createMutation.isPending;

  const busyLabel = isUploading
    ? "Uploading..."
    : isAnalyzing
      ? "Analyzing..."
      : null;

  return (
    <Modal
      ref={modalRef}
      title={step === "input" ? "Receipt Analysis" : "Confirm Spending"}
      description={
        step === "input"
          ? "Upload a receipt image and the AI will extract the details."
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
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button onClick={handleAnalyze} disabled={isBusy || !file}>
              {isBusy ? (
                <>{busyLabel}</>
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
        <div className="flex flex-col gap-3">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isBusy && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDrop={isBusy ? undefined : handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={[
              "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
              previewUrl ? "min-h-48 p-2" : "min-h-40 p-6",
              isBusy
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-(--lagoon) hover:bg-(--lagoon)/5",
              fileError
                ? "border-destructive"
                : "border-(--line)",
            ].join(" ")}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-h-60 w-full rounded-lg object-contain"
              />
            ) : (
              <>
                <div className="flex size-10 items-center justify-center rounded-full bg-(--surface-strong)">
                  <ImageIcon className="size-5 text-(--sea-ink-soft)" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-(--sea-ink)">
                    Click or drag to upload
                  </p>
                  <p className="text-xs text-(--sea-ink-soft)/60">
                    JPG, PNG, WEBP — max 10 MB
                  </p>
                </div>
              </>
            )}

            {/* Re-upload overlay when image already selected */}
            {previewUrl && !isBusy && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-(--sea-ink)">
                  <UploadIcon className="size-3.5" />
                  Change image
                </div>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isBusy}
          />

          {fileError && (
            <p className="text-xs text-destructive">{fileError}</p>
          )}

          {(uploadMutation.isError || analyzeMutation.isError) && (
            <p className="text-xs text-destructive">
              {uploadMutation.isError
                ? "Upload failed. Please try again."
                : "Analysis failed. Please try again."}
            </p>
          )}

          {file && !isBusy && (
            <p className="text-xs text-(--sea-ink-soft)/60 truncate">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
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
