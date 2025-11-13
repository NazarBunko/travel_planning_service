import React, { FC, MouseEvent, ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  className?: string; 
}

const Button: FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  className,
  ...props 
}) => {
  const baseClasses = `
    py-2 px-4 
    bg-blue-600 hover:bg-blue-700 
    text-white font-semibold 
    border border-transparent rounded 
    shadow-md 
    transition-all duration-200 
    w-full
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const stateClasses = (disabled || loading)
    ? `cursor-not-allowed opacity-60`
    : `cursor-pointer`;

  const finalClasses = `${baseClasses} ${stateClasses} ${className || ''}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClasses}
      {...props}
    >
      {loading ? 'Завантаження...' : children}
    </button>
  );
}

export default Button;