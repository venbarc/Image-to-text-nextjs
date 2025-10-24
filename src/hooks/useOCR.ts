import { useState, useCallback } from 'react';
import { createWorker, PSM } from 'tesseract.js';

export interface OCRState {
  image: string | null;
  text: string;
  loading: boolean;
  showResults: boolean;
  shouldScroll: boolean;
  showToast: boolean;
  isDragOver: boolean;
  showCamera: boolean;
  facingMode: 'user' | 'environment';
  toastMessage: string;
}

interface UseOCRProps {
  initialFacingMode?: 'user' | 'environment';
}

export const useOCR = ({ initialFacingMode = 'user' }: UseOCRProps = {}) => {
  const [state, setState] = useState<OCRState>({
    image: null,
    text: '',
    loading: false,
    showResults: false,
    shouldScroll: false,
    showToast: false,
    isDragOver: false,
    showCamera: false,
    facingMode: initialFacingMode,
    toastMessage: '',
  });

  const updateState = useCallback((updates: Partial<OCRState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Function to clean and validate extracted text
  const cleanText = useCallback((text: string): string => {
    if (!text) return '';

    let cleaned = text
      // Remove all non-alphanumeric characters except basic punctuation and spaces
      .replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '')
      // Remove single characters on their own lines
      .replace(/^\s*[^a-zA-Z0-9\s]{1,2}\s*$/gm, '')
      // Remove lines that are mostly special characters
      .replace(/^[^a-zA-Z0-9]{3,}$/gm, '')
      // Fix common OCR misrecognitions
      .replace(/@/g, 'a')
      .replace(/!/g, 'i')
      .replace(/\[/g, 'l')
      .replace(/\|/g, 'l')
      .replace(/0/g, 'o')
      .replace(/5/g, 's')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Trim and clean up
      .trim();

    return cleaned;
  }, []);

  // Function to check if text contains meaningful content - MUCH STRICTER
  const hasMeaningfulText = useCallback((text: string): boolean => {
    if (!text) return false;

    // Count actual words (sequences of letters)
    const words = text.match(/[a-zA-Z]{2,}/g) || [];
    
    // Count sentences (sequences ending with .!?)
    const sentences = text.match(/[^.!?]*[.!?]/g) || [];
    
    // Check for meaningful patterns
    const hasRealWords = words.length >= 2;
    const hasCompleteSentences = sentences.length >= 1;
    const hasQuestion = text.includes('?');
    const hasMeaningfulNumbers = /[0-9]/.test(text) && words.length >= 1;
    
    // Check if text contains common meaningful phrases
    const commonPhrases = [
      'what', 'when', 'where', 'why', 'how', 'who',
      'the', 'and', 'for', 'are', 'but', 'not',
      'this', 'that', 'with', 'have', 'from', 'they'
    ];
    
    const hasCommonWords = commonPhrases.some(phrase => 
      text.toLowerCase().includes(phrase)
    );

    // Consider it meaningful only if it meets multiple criteria
    return (
      (hasRealWords && hasCommonWords) ||
      (hasCompleteSentences && words.length >= 3) ||
      (hasQuestion && words.length >= 2) ||
      (hasMeaningfulNumbers && words.length >= 1)
    );
  }, []);

  // Function to calculate text confidence score
  const getTextConfidence = useCallback((text: string): number => {
    if (!text) return 0;

    const words = text.match(/[a-zA-Z]{2,}/g) || [];
    const totalChars = text.replace(/\s/g, '').length;
    const letterRatio = (text.match(/[a-zA-Z]/g) || []).length / Math.max(totalChars, 1);
    
    // Penalize text with too many random characters
    const randomCharPenalty = (text.match(/[^a-zA-Z0-9\s.,!?;:'"-]/g) || []).length / Math.max(totalChars, 1);
    
    let score = words.length * 10 + letterRatio * 50;
    score -= randomCharPenalty * 100;
    
    return Math.max(0, score);
  }, []);

  const convertImageToText = useCallback(async (image: string) => {
    if (!image) return;

    updateState({ 
      loading: true, 
      text: '', 
      showResults: false,
      toastMessage: ''
    });

    try {
      const worker = await createWorker('eng');

      // Configure Tesseract for better accuracy
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:\'\"-()',
      });

      const { data } = await worker.recognize(image);
      await worker.terminate();
      
      console.log('Raw OCR result:', data.text);
      console.log('Confidence:', data.confidence);
      
      const cleanedText = cleanText(data.text);
      const confidenceScore = getTextConfidence(cleanedText);
      const hasText = hasMeaningfulText(cleanedText);
      
      console.log('Cleaned text:', cleanedText);
      console.log('Confidence score:', confidenceScore);
      console.log('Has meaningful text:', hasText);

      // Use multiple criteria to determine if text is valid
      const isValidText = hasText && confidenceScore > 20 && data.confidence > 30;

      if (isValidText && cleanedText.length > 0) {
        updateState({ 
          text: cleanedText, 
          showResults: true, 
          shouldScroll: true,
          loading: false 
        });
      } else {
        updateState({ 
          text: '',
          showResults: false,
          loading: false,
          toastMessage: 'No readable text found in image',
          showToast: true
        });
      }
      
    } catch (error) {
      console.error('Error converting image to text:', error);
      updateState({ 
        text: '',
        showResults: false,
        loading: false,
        toastMessage: 'Error processing image. Please try again with a clearer image.',
        showToast: true
      });
    }
  }, [updateState, cleanText, hasMeaningfulText, getTextConfidence]);

  const clearAll = useCallback(() => {
    updateState({
      image: null,
      text: '',
      showResults: false,
      toastMessage: ''
    });
  }, [updateState]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      updateState({ 
        showToast: true,
        toastMessage: 'Text copied to clipboard!'
      });
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