import React, { useEffect, useState } from 'react';

interface CameraInterfaceProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onTakePhoto: () => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  isMobile: boolean;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({
  videoRef,
  canvasRef,
  onTakePhoto,
  onStopCamera,
  onSwitchCamera,
  isMobile,
}) => {
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

  // Auto-switch camera when component mounts for both desktop and mobile
  useEffect(() => {
    if (!hasAutoSwitched) {
      console.log('Auto-switching from front to back camera...');
      
      // Wait to ensure first camera is fully initialized
      const timer = setTimeout(() => {
        onSwitchCamera();
        setHasAutoSwitched(true);
      }, 800); // Slightly shorter delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [onSwitchCamera, hasAutoSwitched]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain max-h-full"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="bg-black bg-opacity-70 p-6 flex justify-center items-center gap-6 fixed bottom-0 left-0 right-0 z-60">
        <button
          onClick={onStopCamera}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <CloseIcon />
          Cancel
        </button>
        
        <button
          onClick={onTakePhoto}
          className="bg-white hover:bg-gray-200 text-black w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-300 transition-colors"
        >
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400"></div>
        </button>
        
        {/* Show switch camera button on all devices */}
        <button
          onClick={onSwitchCamera}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <SwitchCameraIcon />
          Switch Camera
        </button>
      </div>
    </div>
  );
};

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SwitchCameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);