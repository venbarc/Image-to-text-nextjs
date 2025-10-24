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
        
        // Wait for video to be ready with better error handling
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const onLoaded = () => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            resolve(true);
          };

          const onError = (error: any) => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            reject(error);
          };

          videoRef.current.addEventListener('loadedmetadata', onLoaded);
          videoRef.current.addEventListener('error', onError);

          // Timeout after 5 seconds
          setTimeout(() => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            videoRef.current?.removeEventListener('error', onError);
            reject(new Error('Camera initialization timeout'));
          }, 5000);
        });
        
        // Play the video
        try {
          await videoRef.current.play();
          console.log('Camera started successfully');
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw new Error('Failed to start camera video stream');
        }
      }

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // If the requested camera fails, try the opposite one automatically
      const fallbackMode = facingMode === 'environment' ? 'user' : 'environment';
      console.log(`Primary camera (${facingMode}) failed, trying fallback (${fallbackMode})...`);
      
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
          await videoRef.current.play();
        }
        
        console.log('Fallback camera started successfully');
        return true;
      } catch (fallbackError) {
        console.error('Fallback camera also failed:', fallbackError);
        throw new Error('Unable to access any camera. Please check permissions and ensure no other app is using the camera.');
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