import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { CategoryBadge, SourceBadge } from "#/components/ui/badge";
import { services } from "#/services";
import { formatDate, formatCurrency } from "#/utils/format";
import type { IdDialogHandle } from "./spending-form";

type DetailRowProps = { label: string; children: React.ReactNode };

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-(--sea-ink-soft)/70">
        {label}
      </span>
      <span className="text-sm text-(--sea-ink)">{children}</span>
    </div>
  );
}

const DialogDetail = React.forwardRef<IdDialogHandle, {}>((_, outerRef) => {
  const [id, setId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useImperativeHandle(outerRef, () => ({
    open: (spendingId: string) => {
      setId(spendingId);
      setOpen(true);
    },
    close: () => setOpen(false),
  }));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setId(null);
  };

  const { data, isLoading } = useQuery({
    ...services.spending.getById(id ?? ""),
    enabled: !!id && open,
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spending Detail</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex items-center justify-center py-8 text-sm text-(--sea-ink-soft)">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <DetailRow label="Title">{data.title}</DetailRow>
            <DetailRow label="Amount">{formatCurrency(data.amount)}</DetailRow>
            <DetailRow label="Date">{formatDate(data.date)}</DetailRow>
            <DetailRow label="Category">
              <CategoryBadge category={data.category} />
            </DetailRow>
            <DetailRow label="Source">
              <SourceBadge source={data.source} />
            </DetailRow>
            {data.note && <DetailRow label="Note">{data.note}</DetailRow>}
            {data.rawText && (
              <DetailRow label="Raw Text">
                <span className="line-clamp-3 whitespace-pre-line text-xs text-(--sea-ink-soft)">
                  {data.rawText}
                </span>
              </DetailRow>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

DialogDetail.displayName = "DialogDetail";

export { DialogDetail };
