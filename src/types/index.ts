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
}

export interface CameraRefs {
  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  stream: React.MutableRefObject<MediaStream | null>;
}