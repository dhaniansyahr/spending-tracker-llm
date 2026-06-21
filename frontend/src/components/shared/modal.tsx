import * as React from "react";

import { cn } from "#/utils/classname";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog.tsx";

export type ModalHandle = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
};

type ModalProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

const Modal = React.forwardRef<ModalHandle, ModalProps>(
  ({ title, description, footer, children, className, onOpenChange }, ref) => {
    const [open, setOpen] = React.useState(false);

    const handleOpenChange = React.useCallback(
      (next: boolean) => {
        setOpen(next);
        onOpenChange?.(next);
      },
      [onOpenChange],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        open: () => handleOpenChange(true),
        close: () => handleOpenChange(false),
        isOpen: () => open,
      }),
      [open, handleOpenChange],
    );

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={cn("sm:max-w-lg", className)}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {children}

          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  },
);

Modal.displayName = "Modal";

export { Modal };
