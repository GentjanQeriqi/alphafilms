export interface Photo {
  id: string;
  sessionId: string;
  filename: string;
  originalPath: string;
  webPath: string;
  size: number;
  width: number;
  height: number;
  uploadedAt: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}
