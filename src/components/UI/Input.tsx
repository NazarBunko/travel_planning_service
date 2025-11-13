import React, { FC, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string; 
}

const Input: FC<InputProps> = ({ className, disabled, ...props }) => {
  const baseClasses = `
    py-2 px-3 
    border border-gray-300 rounded 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    w-full block 
    transition duration-150 ease-in-out 
    mt-1 mb-1
  `;

  const stateClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : '';

  const finalClasses = `${baseClasses} ${stateClasses} ${className || ''}`;

  return (
    <input 
      disabled={disabled}
      className={finalClasses}
      {...props} 
    />
  );
}

export default Input;