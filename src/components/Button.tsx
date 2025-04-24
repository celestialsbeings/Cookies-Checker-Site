import React from 'react';
import { useSound } from '../hooks/useSound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const { playClickSound } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    onClick?.(e);
  };

  const baseClasses = variant === 'primary' ? 'button-primary' : 'button-secondary';

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
};