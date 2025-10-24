'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setText('');
        setShowResults(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
      
      streamRef.current = stream;
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL and set as image
      const photoDataUrl = canvas.toDataURL('image/png');
      setImage(photoDataUrl);
      setText('');
      setShowResults(false);
      
      // Stop camera after taking photo
      stopCamera();
    }
  };

  const switchCamera = async () => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Switch facing mode
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    
    // Restart camera with new facing mode
    await startCamera();
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        alert('Please drop a valid image file (PNG, JPG, JPEG)');
      }
    }
  }, []);

  // Add event listeners for drag and drop
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (dropArea) {
      dropArea.addEventListener('dragover', handleDragOver as any);
      dropArea.addEventListener('dragleave', handleDragLeave as any);
      dropArea.addEventListener('drop', handleDrop as any);

      return () => {
        dropArea.removeEventListener('dragover', handleDragOver as any);
        dropArea.removeEventListener('dragleave', handleDragLeave as any);
        dropArea.removeEventListener('drop', handleDrop as any);
      };
    }
  }, [handleDragOver, handleDragLeave, handleDrop]);

  const convertImageToText = async () => {
    if (!image) return;

    setLoading(true);
    setText('');
    setShowResults(false);

    try {
      const worker = await createWorker('eng');
      
      const { data } = await worker.recognize(image);
      setText(data.text);
      
      await worker.terminate();
      
      // Trigger the animation and scroll
      setShowResults(true);
      setShouldScroll(true);
    } catch (error) {
      console.error('Error converting image to text:', error);
      setText('Error converting image to text. Please try again.');
      setShowResults(true);
      setShouldScroll(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle the scroll animation when shouldScroll is true
  useEffect(() => {
    if (shouldScroll && resultsRef.current && text) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        setShouldScroll(false);
      }, 300); // Small delay to allow the fade-in animation to start

      return () => clearTimeout(timer);
    }
  }, [shouldScroll, text]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const clearAll = () => {
    setImage(null);
    setText('');
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCamera();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Image to Text Converter
          </h1>
        </div>

        {/* Camera Interface - Fixed positioning with proper z-index */}
        {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Camera preview */}
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
            
            {/* Camera controls - Fixed at bottom with proper styling */}
            <div className="bg-black bg-opacity-70 p-6 flex justify-center items-center gap-6 fixed bottom-0 left-0 right-0 z-60">
              <button
                onClick={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              
              <button
                onClick={takePhoto}
                className="bg-white hover:bg-gray-200 text-black w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-300 transition-colors"
              >
                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400"></div>
              </button>
              
              <button
                onClick={switchCamera}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Switch Camera
              </button>
            </div>
          </div>
        )}

        {/* Upload Section with Drag & Drop */}
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
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
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

          {/* Take Photo Button - Show on all devices */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={startCamera}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
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
                  onClick={clearAll}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={convertImageToText}
            disabled={!image || loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Text'
            )}
          </button>

          <button
            onClick={clearAll}
            disabled={!image && !text}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Results Section with Animation */}
        {showResults && text && (
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
                onClick={copyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Text
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                {text || 'No text detected'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Text copied to clipboard!</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-white hover:text-green-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}