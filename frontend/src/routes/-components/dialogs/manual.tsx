import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, type ModalHandle } from "#/components/shared/modal";
import { Button } from "#/components/ui/button";
import { services } from "#/services";
import { schemaSpending } from "#/services/spendings/type";
import {
  SpendingFormFields,
  initialFormState,
  type SpendingFormState,
} from "./spending-form";

const DialogCreateManual = React.forwardRef<ModalHandle, {}>((_, outerRef) => {
  const modalRef = React.useRef<ModalHandle>(null);
  const [form, setForm] = React.useState<SpendingFormState>(initialFormState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  React.useImperativeHandle(outerRef, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
    isOpen: () => modalRef.current?.isOpen() ?? false,
  }));

  const { mutate, isPending } = useMutation({
    ...services.spending.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      modalRef.current?.close();
    },
  });

  const resetForm = React.useCallback(() => {
    setForm(initialFormState);
    setErrors({});
  }, []);

  const handleChange = React.useCallback(
    (field: keyof SpendingFormState, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleSubmit = React.useCallback(() => {
    const result = schemaSpending.safeParse({
      title: form.title,
      amount: Number(form.amount),
      category: form.category || undefined,
      source: "MANUAL",
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
    mutate(result.data);
  }, [form, mutate]);

  return (
    <Modal
      ref={modalRef}
      title="Add Spending"
      description="Enter spending details manually."
      onOpenChange={(open) => {
        if (!open) resetForm();
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => modalRef.current?.close()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      <SpendingFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        disabled={isPending}
      />
    </Modal>
  );
});

DialogCreateManual.displayName = "DialogCreateManual";

export { DialogCreateManual };
