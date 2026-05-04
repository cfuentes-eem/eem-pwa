'use client';

import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

const variantClasses = {
  primary: 'bg-eem-red hover:bg-eem-red-deep text-white',
  secondary: 'bg-white border border-eem-line hover:bg-eem-grey-15 text-eem-dark',
  ghost: 'bg-transparent hover:bg-eem-grey-15 text-eem-dark',
};

export function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} rounded-2xl px-5 py-3.5 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
