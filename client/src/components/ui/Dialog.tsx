import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-between p-6 border-b', className)}
    {...props}
  />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
);

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('p-6', className)}
    {...props}
  />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex justify-end space-x-2 p-6 border-t', className)}
    {...props}
  />
);

interface DialogCloseProps {
  onClick: () => void;
}

export const DialogClose: React.FC<DialogCloseProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100"
  >
    <X className="h-4 w-4" />
  </button>
);