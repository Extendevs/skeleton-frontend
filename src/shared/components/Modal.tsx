import { PropsWithChildren, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../ui/dialog';

interface ModalProps {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

/**
 * Modal component built on top of Radix UI Dialog
 * Provides accessible modal dialogs with proper focus management
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  footer, 
  children 
}: PropsWithChildren<ModalProps>): JSX.Element => {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody>
          {children}
        </DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
