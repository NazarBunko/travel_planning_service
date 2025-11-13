import React, { FC, MouseEvent, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string; 
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  
  const backdropClasses = `
    fixed inset-0 
    bg-black bg-opacity-50 
    flex justify-center items-center 
    z-[1000]
  `;

  const contentClasses = `
    bg-white p-6 rounded-lg shadow-xl 
    max-w-md w-[90%] 
    relative ${className || ''}
  `;

  const headerClasses = `
    flex justify-between items-center 
    mb-4 pb-3 
    border-b border-gray-200
  `;

  const closeButtonClasses = `
    bg-transparent border-none text-2xl 
    cursor-pointer p-2 
    leading-none text-gray-600 hover:text-gray-900 
    focus:outline-none
  `;

  return (
    <div 
      className={backdropClasses}
      onClick={handleBackdropClick}
    >
      <div 
        className={contentClasses}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className={headerClasses}>
            <h3 className="text-xl font-semibold">{title || "Модальне Вікно"}</h3>
            <button 
                onClick={onClose} 
                className={closeButtonClasses}
            >
                &times;
            </button>
        </div>
        
        {children}

      </div>
    </div>
  );
}

export default Modal;