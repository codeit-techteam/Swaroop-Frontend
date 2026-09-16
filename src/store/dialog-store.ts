import { create } from 'zustand';

export type AppDialogVariant = 'info' | 'success' | 'warning' | 'danger';

export type AppDialogChoice = {
  id: string;
  label: string;
  description?: string;
  onPress: () => void;
};

export type AppDialogConfig = {
  title: string;
  message?: string;
  variant?: AppDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  choices?: AppDialogChoice[];
  dismissible?: boolean;
};

type DialogState = {
  dialog: AppDialogConfig | null;
  show: (config: AppDialogConfig) => void;
  hide: () => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  dialog: null,
  show: (config) => set({ dialog: { dismissible: true, variant: 'info', ...config } }),
  hide: () => set({ dialog: null }),
}));

export const showAppDialog = (config: AppDialogConfig): void => {
  useDialogStore.getState().show(config);
};

export const hideAppDialog = (): void => {
  useDialogStore.getState().hide();
};

export const showInfoDialog = (title: string, message: string, confirmLabel = 'Got it'): void => {
  showAppDialog({
    variant: 'info',
    title,
    message,
    confirmLabel,
  });
};

export const showConfirmDialog = (config: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: AppDialogVariant;
  onConfirm: () => void;
}): void => {
  showAppDialog({
    variant: config.variant ?? 'danger',
    title: config.title,
    message: config.message,
    confirmLabel: config.confirmLabel,
    cancelLabel: config.cancelLabel ?? 'Cancel',
    onConfirm: config.onConfirm,
  });
};
