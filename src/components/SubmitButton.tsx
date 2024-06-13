// This is a form submit button that triggers the form action when clicked.

'use client';

import { useFormStatus } from 'react-dom';
import { type ComponentProps } from 'react';
import { Button, ButtonProps } from './ui/button';
import { BarLoader } from 'react-spinners';

type Props = ComponentProps<'button'> &
  ButtonProps & {
    loaderColor?: string;
  };

export function SubmitButton({ loaderColor, children, ...props }: Props) {
  const { pending, action } = useFormStatus();

  // Checks if the form is pending and the action matches the form action
  const isPending = pending && action === props.formAction;

  return (
    <Button {...props} type='submit' aria-disabled={pending} disabled={pending}>
      {isPending ? <BarLoader height={1} color={loaderColor ?? 'white'} /> : children}
    </Button>
  );
}
