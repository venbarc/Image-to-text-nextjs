import React from 'react';
import Image from 'next/image';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  onTakePhoto: () => void;
  image: string | null;
  onClearImage: () => void;
  isDragOver: boolean;
  dropAreaRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onFileUpload,
  onTakePhoto,
  image,
  onClearImage,
  isDragOver,
  dropAreaRef,
  fileInputRef,
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div 
        ref={dropAreaRef}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer block"
        >
          <div className="flex flex-col items-center justify-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
              ${isDragOver ? 'bg-blue-200' : 'bg-blue-100'}
            `}>
              {isDragOver ? (
                <UploadIcon />
              ) : (
                <ImageIcon />
              )}
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragOver ? 'Drop your image here' : 'Upload an Image'}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              PNG, JPG, JPEG supported
            </p>
            <p className="text-xs text-gray-400">
              or drag and drop your image here
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onTakePhoto}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <CameraIcon />
          Take Photo
        </button>
      </div>

      {image && (
        <div className="mt-6">
          <div className="relative w-full max-w-md mx-auto">
            <Image
              src={image}
              alt="Uploaded preview"
              width={400}
              height={300}
              className="rounded-lg shadow-md mx-auto"
            />
            <button
              onClick={onClearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UploadIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);