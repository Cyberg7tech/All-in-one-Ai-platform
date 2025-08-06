// This is a form submit button that triggers the form action when clicked.

'use client';

import { useFormStatus } from 'react-dom';
import { ReactNode, type ComponentProps } from 'react';
import { Button, ButtonProps } from './ui/button';
import { BarLoader } from 'react-spinners';
import { LuLoader } from 'react-icons/lu';

type Props = ComponentProps<'button'> &
  ButtonProps & {
    isCircleLoader?: ReactNode;
    loaderColor?: string;
    isLoading?: boolean;
  };

export function SubmitButton({ isCircleLoader, loaderColor, children, isLoading, ...props }: Props) {
  const { pending, action } = useFormStatus();

  // Checks if the form is pending and the action matches the form action
  const isPending = pending && action === props.formAction;

  return (
    <Button
      {...props}
      type='submit'
      aria-disabled={pending}
      disabled={isLoading || isPending || props.disabled}>
      {isPending || isLoading ? (
        isCircleLoader ? (
          <LuLoader className='animate-[spin_3s_linear_infinite]' size={16} />
        ) : (
          <BarLoader height={1} color={loaderColor ?? 'white'} />
        )
      ) : (
        children
      )}
    </Button>
  );
}
