import * as React from "react";
import type { ModalHandle } from "#/components/shared/modal";
import { DialogCreateManual } from "./manual";
import { DialogCreateText } from "./text";
import { DialogCreateReceipt } from "./receipt";
import { DialogEdit } from "./edit";
import { DialogDetail } from "./detail";
import { DialogAnalysisVerdict } from "./dialog-analysis-verdict";
import type { IdDialogHandle } from "./spending-form";

export type SpendingDialogsHandle = {
  openCreateManual: () => void;
  openCreateText: () => void;
  openCreateReceipt: () => void;
  openEdit: (id: string) => void;
  openDetail: (id: string) => void;
  openAnalysisVerdict: () => void;
};

const SpendingDialogs = React.forwardRef<SpendingDialogsHandle, {}>(
  (_, outerRef) => {
    const createManualRef = React.useRef<ModalHandle>(null);
    const createTextRef = React.useRef<ModalHandle>(null);
    const createReceiptRef = React.useRef<ModalHandle>(null);
    const editRef = React.useRef<IdDialogHandle>(null);
    const detailRef = React.useRef<IdDialogHandle>(null);
    const analysisVerdictRef = React.useRef<ModalHandle>(null);

    React.useImperativeHandle(outerRef, () => ({
      openCreateManual: () => createManualRef.current?.open(),
      openCreateText: () => createTextRef.current?.open(),
      openCreateReceipt: () => createReceiptRef.current?.open(),
      openEdit: (id) => editRef.current?.open(id),
      openDetail: (id) => detailRef.current?.open(id),
      openAnalysisVerdict: () => analysisVerdictRef.current?.open(),
    }));

    return (
      <>
        <DialogCreateManual ref={createManualRef} />
        <DialogCreateText ref={createTextRef} />
        <DialogCreateReceipt ref={createReceiptRef} />
        <DialogEdit ref={editRef} />
        <DialogDetail ref={detailRef} />
        <DialogAnalysisVerdict ref={analysisVerdictRef} />
      </>
    );
  },
);

SpendingDialogs.displayName = "SpendingDialogs";

export { SpendingDialogs };
