import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { JSX, PropsWithChildren, ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

interface ModalProps {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: ModalSize;
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
  size = 'md',
  children 
}: PropsWithChildren<ModalProps>): JSX.Element => {
  
   const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-2xl';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'fullscreen':
        return 'max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh]';
      default:
        return 'max-w-2xl';
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
          <DialogContent className={`p-0 ${getSizeClasses()}`}>
            <DialogHeader className="shrink-0 px-6 pt-6">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto px-6">
              {children}
            </div>
            {footer && (
              <DialogFooter className="shrink-0 px-6 pb-6">
                {footer}
              </DialogFooter>
            )}
          </DialogContent>
      </Dialog>
  );
};
