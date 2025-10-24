import React from 'react';

interface ResultsSectionProps {
  text: string;
  onCopyToClipboard: (text: string) => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  text,
  onCopyToClipboard,
  resultsRef,
}) => {
  return (
    <div 
      ref={resultsRef}
      className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-500 ease-out"
      style={{
        animation: 'fadeInUp 0.6s ease-out'
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Extracted Text
        </h2>
        <button
          onClick={() => onCopyToClipboard(text)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <CopyIcon />
          Copy Text
        </button>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <pre className="whitespace-pre-wrap text-gray-700 font-sans">
          {text || 'No text detected'}
        </pre>
      </div>
    </div>
  );
};

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);