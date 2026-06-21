import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { services } from "#/services";
import { schemaSpending } from "#/services/spendings/type";
import {
  SpendingFormFields,
  initialFormState,
  fromSpending,
  type SpendingFormState,
  type IdDialogHandle,
} from "./spending-form";

const DialogEdit = React.forwardRef<IdDialogHandle, {}>((_, outerRef) => {
  const [id, setId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<SpendingFormState>(initialFormState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  React.useImperativeHandle(outerRef, () => ({
    open: (spendingId: string) => {
      setId(spendingId);
      setOpen(true);
    },
    close: () => setOpen(false),
  }));

  const { data, isLoading } = useQuery({
    ...services.spending.getById(id ?? ""),
    enabled: !!id && open,
  });

  React.useEffect(() => {
    if (data) setForm(fromSpending(data));
  }, [data]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setId(null);
      setForm(initialFormState);
      setErrors({});
    }
  };

  const { mutate, isPending } = useMutation({
    ...services.spending.update(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      handleOpenChange(false);
    },
  });

  const handleChange = React.useCallback(
    (field: keyof SpendingFormState, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleSubmit = React.useCallback(() => {
    if (!id || !data) return;

    const result = schemaSpending.safeParse({
      title: form.title,
      amount: Number(form.amount),
      category: form.category || undefined,
      source: data.source,
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
    mutate({ id, data: result.data });
  }, [id, data, form, mutate]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Spending</DialogTitle>
          <DialogDescription>Update the spending details below.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-(--sea-ink-soft)">
            Loading...
          </div>
        ) : (
          <SpendingFormFields
            form={form}
            errors={errors}
            onChange={handleChange}
            disabled={isPending}
          />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isLoading}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

DialogEdit.displayName = "DialogEdit";

export { DialogEdit };
