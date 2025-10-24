import React from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  type = 'success',
}) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up`}>
        <CheckIcon />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:opacity-70 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);