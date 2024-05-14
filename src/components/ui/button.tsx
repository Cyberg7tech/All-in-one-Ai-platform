import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0f6fff] dark:bg-[#0f6fff] text-primary-foreground shadow',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input shadow-sm hover:bg-accent/10',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-accent-foreground underline-offset-4 hover:underline',
        blue: 'bg-blue-500 shadow-sm hover:bg-blue-500/90 text-white',
        gray: 'bg-[#3E3E3E] shadow-sm hover:bg-[#3E3E3E]/90 text-white',
        'light-gray':
          'flex items-center justify-start px-2 py-1.5 gap-2 font-semibold tracking-tight border border-transparent hover:bg-light-white hover:dark:bg-light-dark/10 hover:border hover:border-[#E8E8E8] hover:hover:dark:!border-dark hover:!text-[#3E3E3E] rounded-lg text-[#8C8C8C] dark:!text-white',
        'buy-now': 'bg-[#F9F9F9] text-grey text-sm font-semibold dark:bg-[#131313] dark:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
