import { useState, useCallback } from 'react';

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

  const convertImageToText = useCallback(async (image: string) => {
    if (!image) return;

    updateState({ 
      loading: true, 
      text: '', 
      showResults: false,
      toastMessage: ''
    });

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your environment variables.');
      }

      // Extract base64 data and mime type from the data URL
      const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // console.log('Sending image to Gemini API...');
      
      const modelName = 'gemini-2.0-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { 
                text: `Analyze the provided image and produce a human-friendly, well-structured textual output.
                Rules:
                  1) If the image is a grocery/retail receipt:
                    - Extract items, quantities, prices, subtotal, tax, and total when present.
                    - Present them as a clean list with a short summary (merchant, date) where possible.
                    - Group similar items (e.g., "2 x Milk - PHP 120").
                  2) If the image contains a question with options:
                    - Format as: Question: ... then list Options A., B., C., ...
                    - If an answer appears highlighted or selected, indicate that clearly.
                  3) If the image contains general text (notes, labels, paragraphs):
                    - Extract, correct minor OCR mistakes, and present as clean paragraphs or bullet points.
                  4) Do not invent facts that are not visible in the image.
                  5) If text is unreadable or uncertain, say: "Some parts were unclear — please re-upload a clearer photo."

                Return output as plain text, using simple Markdown-like formatting (headings, bullet points) so it is easy to read in the app.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      };

      // console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API error details:', errorData);
          errorMessage = errorData.error?.message || JSON.stringify(errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // console.log('API response received:', data);
      
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText && generatedText.trim().length > 0) {
        // console.log('Success! Generated text length:', generatedText.length);
        updateState({ 
          text: generatedText.trim(), 
          showResults: true, 
          shouldScroll: true,
          loading: false 
        });
      } else {
        // console.log('No text generated from the image');
        updateState({ 
          text: '',
          showResults: false,
          loading: false,
          toastMessage: 'No readable text found in the image. Please try with a clearer image.',
          showToast: true
        });
      }
      
    } catch (error) {
      console.error('Error processing image with Gemini:', error);
      let errorMessage = 'Error processing image. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        
        if (error.message.includes('API key') || error.message.includes('API_KEY')) {
          errorMessage = 'API configuration error. Please check your Gemini API key.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded. Please check your Gemini API usage.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
          errorMessage = 'API permission denied. Please check your API key permissions.';
        } else if (error.message.includes('400') || error.message.includes('INVALID_ARGUMENT')) {
          errorMessage = 'Invalid request. The image format may not be supported.';
        } else {
          errorMessage = `Processing error: ${error.message}`;
        }
      }
      
      updateState({ 
        text: '',
        showResults: false,
        loading: false,
        toastMessage: errorMessage,
        showToast: true
      });
    }
  }, [updateState]);

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
      updateState({
        showToast: true,
        toastMessage: 'Failed to copy text to clipboard'
      });
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