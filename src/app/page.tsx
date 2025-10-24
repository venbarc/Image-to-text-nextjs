'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useOCR } from '../hooks/useOCR';
import { useCamera } from '../hooks/useCamera';
import { useDragDrop } from '../hooks/useDragDrop';
import { useDeviceDetection } from '../hooks/useDeviceDetection'; 
import { UploadArea } from '../components/UploadArea';
import { CameraInterface } from '../components/CameraInterface';
import { ResultsSection } from '../components/ResultsSection';
import { Toast } from '../components/Toast';
import { ActionButtons } from '../components/ActionButtons';

export default function Home() {
  const { isMobile } = useDeviceDetection();
  
  // Determine initial camera based on device type
  // Mobile: Start with front camera (user) so auto-switch goes to back
  // Desktop: Start with front camera (user) so auto-switch goes to back
  const initialFacingMode = 'user'; // Always start with front camera

  const {
    state,
    updateState,
    convertImageToText,
    clearAll,
    copyToClipboard,
  } = useOCR({ initialFacingMode });

  const {
    videoRef,
    canvasRef,
    streamRef,
    startCamera,
    stopCamera,
    takePhoto,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      updateState({ 
        image: event.target?.result as string,
        text: '',
        showResults: false 
      });
    };
    reader.readAsDataURL(file);
  }, [updateState]);

  const { isDragOver, dropAreaRef } = useDragDrop(handleFileUpload);

  // Define handleSwitchCamera first
  const handleSwitchCamera = useCallback(async () => {
    const newFacingMode = state.facingMode === 'user' ? 'environment' : 'user';
    updateState({ facingMode: newFacingMode });
    
    if (streamRef.current) {
      stopCamera();
      await startCamera(newFacingMode);
    }
  }, [state.facingMode, updateState, stopCamera, startCamera, streamRef]);

  // Camera handlers
  const handleStartCamera = useCallback(async () => {
    try {
      console.log('Starting camera for device:', isMobile ? 'mobile' : 'desktop');
      
      // Always start with front camera (user)
      // This way auto-switch will go to back camera (environment)
      const startingCamera = 'user';
      
      await startCamera(startingCamera);
      updateState({ 
        showCamera: true,
        facingMode: startingCamera 
      });
      
    } catch (error) {
      console.error('Camera error:', error);
      alert(error instanceof Error ? error.message : 'Unable to access camera. Please check permissions.');
    }
  }, [startCamera, updateState, isMobile]);

  const handleStopCamera = useCallback(() => {
    stopCamera();
    updateState({ showCamera: false });
  }, [stopCamera, updateState]);

  const handleTakePhoto = useCallback(() => {
    const photoDataUrl = takePhoto();
    if (photoDataUrl) {
      updateState({ 
        image: photoDataUrl,
        text: '',
        showResults: false 
      });
      handleStopCamera();
    }
  }, [takePhoto, updateState, handleStopCamera]);

  const handleClearImage = useCallback(() => {
    updateState({ image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [updateState]);

  const handleClearAll = useCallback(() => {
    clearAll();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearAll]);

  // Effects
  useEffect(() => {
    if (state.shouldScroll && resultsRef.current && state.text) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        updateState({ shouldScroll: false });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.shouldScroll, state.text, updateState]);

  useEffect(() => {
    if (state.showToast) {
      const timer = setTimeout(() => {
        updateState({ showToast: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.showToast, updateState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Image to Text Converter
          </h1>
          {/* Debug info - you can remove this later */}
          {/* <p className="text-sm text-gray-600">
            {isMobile ? 'Mobile Mode (Starting: Front Camera)' : 'Desktop Mode (Starting: Front Camera)'} - Current: {state.facingMode}
          </p> */}
        </div>

        {/* Camera Interface */}
        {state.showCamera && (
          <CameraInterface
            videoRef={videoRef}
            canvasRef={canvasRef}
            onTakePhoto={handleTakePhoto}
            onStopCamera={handleStopCamera}
            onSwitchCamera={handleSwitchCamera}
            isMobile={isMobile}
          />
        )}

        {/* Upload Area */}
        <UploadArea
          onFileUpload={handleFileUpload}
          onTakePhoto={handleStartCamera}
          image={state.image}
          onClearImage={handleClearImage}
          isDragOver={isDragOver}
          dropAreaRef={dropAreaRef}
          fileInputRef={fileInputRef}
        />

        {/* Action Buttons */}
        <ActionButtons
          onConvert={() => convertImageToText(state.image!)}
          onClear={handleClearAll} 
          disabled={!state.image}
          loading={state.loading}
        />

        {/* Results Section */}
        {state.showResults && state.text && (
          <ResultsSection
            text={state.text}
            onCopyToClipboard={copyToClipboard}
            resultsRef={resultsRef}
          />
        )}
      </div>

      {/* Toast Notification */}
      {state.showToast && (
        <Toast
          message="Text copied to clipboard!"
          onClose={() => updateState({ showToast: false })}
          type="success"
        />
      )}
    </div>
  );
}