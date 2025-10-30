
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`
        block w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-600 
        text-gray-200 placeholder-gray-500 focus:outline-none 
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        transition-all
        ${className}
      `}
      {...props}
    />
  );
};

export default Input;
