"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => unknown | Promise<unknown>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await Promise.resolve(onConfirm());
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={(props) => (
              <Button {...props} variant="outline" className="rounded-xl">
                {cancelLabel}
              </Button>
            )}
          />
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={
              destructive
                ? "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "rounded-xl bg-foreground text-background hover:bg-foreground/85"
            }
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
