import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800 shadow-sm',
        destructive:
          'bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800 shadow-sm',
        outline:
          'border border-border bg-white text-text-primary hover:bg-accent hover:border-border-bold active:bg-accent-3000 shadow-sm',
        secondary:
          'bg-accent text-text-primary border border-border hover:bg-accent-3000 hover:border-border-bold active:bg-accent-3000 shadow-sm',
        ghost: 'text-text-primary hover:bg-accent active:bg-accent-3000 border border-transparent',
        link: 'text-link hover:text-link-hover active:text-link-hover underline-offset-4 hover:underline border-none bg-transparent shadow-none p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm rounded-md',
        sm: 'h-8 px-3 py-1.5 text-xs rounded-md',
        lg: 'h-12 px-6 py-3 text-base rounded-md',
        icon: 'h-10 w-10 p-2 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | null | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
