'use client';

import { useState, useCallback } from 'react';
import { FILE_UPLOAD } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';

interface UseFileUploadOptions {
  endpoint?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface UseFileUploadReturn {
  file: UploadedFile | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  removeFile: () => void;
  validate: (file: File) => string | null;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    endpoint = '/api/v1/uploads',
    maxSizeMB = FILE_UPLOAD.maxSizeMB,
    acceptedTypes = FILE_UPLOAD.acceptedTypes,
  } = options;

  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (f: File): string | null => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (f.size > maxBytes) {
        return `File size must be less than ${maxSizeMB}MB`;
      }
      if (!(acceptedTypes as string[]).includes(f.type)) {
        return 'Only PDF, JPG, and PNG files are accepted';
      }
      return null;
    },
    [maxSizeMB, acceptedTypes]
  );

  const upload = useCallback(
    async (f: File): Promise<string | null> => {
      const validationError = validate(f);
      if (validationError) {
        setError(validationError);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const formData = new FormData();
        formData.append('file', f);

        const response = await apiClient.upload<{ url: string }>(endpoint, formData);

        clearInterval(progressInterval);
        setProgress(100);

        const uploaded: UploadedFile = {
          name: f.name,
          size: f.size,
          type: f.type,
          url: response.url,
        };

        setFile(uploaded);
        setIsUploading(false);
        return response.url;
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : 'Upload failed');
        setIsUploading(false);
        setProgress(0);
        return null;
      }
    },
    [endpoint, validate]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    file,
    isUploading,
    progress,
    error,
    upload,
    removeFile,
    validate,
  };
}
