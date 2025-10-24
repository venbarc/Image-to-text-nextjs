import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { OCRState } from '@/types';

export const useOCR = () => {
  const [state, setState] = useState<OCRState>({
    image: null,
    text: '',
    loading: false,
    showResults: false,
    shouldScroll: false,
    showToast: false,
    isDragOver: false,
    showCamera: false,
    facingMode: 'environment',
  });

  const updateState = useCallback((updates: Partial<OCRState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const convertImageToText = useCallback(async (image: string) => {
    if (!image) return;

    updateState({ 
      loading: true, 
      text: '', 
      showResults: false 
    });

    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(image);
      await worker.terminate();
      
      updateState({ 
        text: data.text, 
        showResults: true, 
        shouldScroll: true,
        loading: false 
      });
    } catch (error) {
      console.error('Error converting image to text:', error);
      updateState({ 
        text: 'Error converting image to text. Please try again.',
        showResults: true,
        shouldScroll: true,
        loading: false 
      });
    }
  }, [updateState]);

  const clearAll = useCallback(() => {
    updateState({
      image: null,
      text: '',
      showResults: false,
    });
  }, [updateState]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      updateState({ showToast: true });
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [updateState]);

  return {
    state,
    updateState,
    convertImageToText,
    clearAll,
    copyToClipboard,
  };
};