import { PropsWithChildren, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  type?: ToastType;
  title?: string;
  description?: string;
};

const toasterOptions = {
  position: 'bottom-center' as const,
  toastOptions: {
    className:
      'rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg',
    descriptionClassName: 'text-xs text-slate-500',
    actionButtonStyle: {
      backgroundColor: '#1f2937'
    }
  }
};

export interface ToastProviderProps extends PropsWithChildren {}

export const ToastProvider = ({ children }: ToastProviderProps): JSX.Element => {
  return (
    <>
      {children}
      <Toaster {...toasterOptions} />
    </>
  );
};

export const useToast = () => {
  const notify = useCallback(({ type = 'info', title, description }: ToastOptions) => {
    const message = title ?? description ?? '';
    if (!message) {
      return;
    }

    if (type === 'success') {
      toast.success(message, { description });
      return;
    }

    if (type === 'error') {
      toast.error(message, { description });
      return;
    }

    toast(message, { description });
  }, []);

  return { notify };
};
