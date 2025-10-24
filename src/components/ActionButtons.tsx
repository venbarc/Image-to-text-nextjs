import React from 'react';

interface ActionButtonsProps {
  onConvert: () => void;
  onClear: () => void;
  disabled: boolean;
  loading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onConvert,
  onClear,
  disabled,
  loading,
}) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        onClick={onConvert}
        disabled={disabled || loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <Spinner />
            Converting...
          </>
        ) : (
          'Convert to Text'
        )}
      </button>

      <button
        onClick={onClear}
        disabled={disabled}
        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);