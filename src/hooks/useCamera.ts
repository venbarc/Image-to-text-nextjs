import { useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Clear previous video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      console.log('Starting camera with facingMode:', facingMode);

      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready with a simpler approach
        return new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const onLoaded = () => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            videoRef.current?.play().then(resolve).catch(resolve);
          };

          const onError = () => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            reject(new Error('Camera stream error'));
          };

          videoRef.current.addEventListener('loadedmetadata', onLoaded);
          videoRef.current.addEventListener('error', onError);

          // Shorter timeout
          setTimeout(() => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            resolve(true); // Resolve anyway to continue
          }, 3000);
        });
      }

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Try the opposite camera automatically
      const fallbackMode = facingMode === 'environment' ? 'user' : 'environment';
      console.log(`Primary camera failed, trying fallback: ${fallbackMode}`);
      
      try {
        const fallbackConstraints = {
          video: { 
            facingMode: fallbackMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          return true;
        }
        
        return true;
      } catch (fallbackError) {
        console.error('Fallback camera also failed:', fallbackError);
        throw new Error('Unable to access any camera. Please check permissions.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const takePhoto = useCallback((): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
        return null;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      return canvas.toDataURL('image/png');
    }
    return null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    streamRef,
    startCamera,
    stopCamera,
    takePhoto,
  };
};