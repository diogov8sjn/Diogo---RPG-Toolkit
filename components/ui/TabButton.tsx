
import React from 'react';

interface TabButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ onClick, isActive, children }) => {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200';
  const activeClasses = 'bg-indigo-600 text-white shadow';
  const inactiveClasses = 'text-gray-300 hover:bg-gray-700 hover:text-white';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
};

export default TabButton;
