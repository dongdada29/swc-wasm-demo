import { useState, useCallback } from "react";

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
  });

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          open: true,
          title: options.title,
          description: options.description,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          variant: options.variant,
          onConfirm: () => {
            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    dialogState,
    confirm,
    closeDialog,
  };
}
