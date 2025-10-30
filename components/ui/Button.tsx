
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, className, isLoading, ...props }) => {
  const loadingClasses = isLoading ? 'shimmer relative overflow-hidden' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-md shadow-sm text-white 
        bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900
        disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors
        ${loadingClasses}
        ${className}
      `}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;