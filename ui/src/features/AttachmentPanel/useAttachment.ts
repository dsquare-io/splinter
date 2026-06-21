import { useCallback, useRef, useState } from 'react';

import heic2any from 'heic2any';

import { ApiRoutes } from '@/api-types';
import type { FileAttachment } from '@/api-types/components/schemas';
import { axiosInstance } from '@/axios';
import { useAttachmentConfig } from './useAttachmentConfig';

export type AttachmentStatus = 'uploading' | 'registered' | 'error';

export interface LocalAttachment {
  localId: string;
  file: File;
  filename: string;
  contentType: string;
  fileSize: number;
  status: AttachmentStatus;
  progress: number;
  error?: string;
  uid?: string;
  previewUrl?: string;
}

export interface UseAttachmentReturn {
  pendingAttachments: LocalAttachment[];
  existingAttachments: FileAttachment[];
  addFiles: (files: FileList | File[]) => void;
  removePending: (localId: string) => void;
  removeExisting: (uid: string) => void;
  getAttachmentUids: () => string[];
  initialize: (attachments: FileAttachment[]) => void;
  validationError: string | null;
  clearValidationError: () => void;
}

async function convertHeic(file: File): Promise<File> {
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  const resultBlob = Array.isArray(blob) ? blob[0] : blob;
  return new File([resultBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
}

export function useAttachment(): UseAttachmentReturn {
  const { maxFileSize, allowedContentTypes } = useAttachmentConfig();
  const [pendingAttachments, setPendingAttachments] = useState<LocalAttachment[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<FileAttachment[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const previewUrls = useRef<Map<string, string>>(new Map());

  const updatePending = useCallback((localId: string, updates: Partial<LocalAttachment>) => {
    setPendingAttachments((prev) => prev.map((a) => (a.localId === localId ? { ...a, ...updates } : a)));
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        const contentType = file.type;

        if (!allowedContentTypes.includes(contentType)) {
          setValidationError(`${file.name}: unsupported file type`);
          return;
        }

        if (file.size > maxFileSize) {
          const mb = (maxFileSize / (1024 * 1024)).toFixed(0);
          setValidationError(`${file.name}: file exceeds ${mb} MB limit`);
          return;
        }
      }

      const currentCount =
        existingAttachments.length + pendingAttachments.filter((a) => a.status !== 'error').length;
      if (currentCount + fileArray.length > 10) {
        setValidationError('Maximum 10 attachments per expense');
        return;
      }

      setValidationError(null);

      for (const file of fileArray) {
        const localId = crypto.randomUUID();
        const lower = file.name.toLowerCase();
        const isHeic =
          file.type === 'image/heic' ||
          file.type === 'image/heif' ||
          lower.endsWith('.heic') ||
          lower.endsWith('.heif');

        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage && !isHeic ? URL.createObjectURL(file) : undefined;
        if (previewUrl) previewUrls.current.set(localId, previewUrl);

        setPendingAttachments((prev) => [
          ...prev,
          {
            localId,
            file,
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
            status: 'uploading',
            progress: 0,
            previewUrl,
          },
        ]);

        void (async () => {
          try {
            let prepared = file;
            if (isHeic) {
              prepared = await convertHeic(file);

              const url = URL.createObjectURL(prepared);
              previewUrls.current.set(localId, url);
              updatePending(localId, { previewUrl: url, contentType: prepared.type });
            }

            const formData = new FormData();
            formData.append('file', prepared, file.name);

            const res = await axiosInstance.post<{ uid: string }>(
              ApiRoutes.UPLOAD_FILE_ATTACHMENT,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                  if (e.total) updatePending(localId, { progress: Math.round((e.loaded / e.total) * 100) });
                },
              }
            );

            updatePending(localId, { status: 'registered', uid: res.data.uid, progress: 100 });
          } catch (err) {
            updatePending(localId, {
              status: 'error',
              error: err instanceof Error ? err.message : 'Upload failed',
            });
          }
        })();
      }
    },
    [allowedContentTypes, existingAttachments.length, maxFileSize, pendingAttachments, updatePending]
  );

  const removePending = useCallback((localId: string) => {
    const url = previewUrls.current.get(localId);
    if (url) {
      URL.revokeObjectURL(url);
      previewUrls.current.delete(localId);
    }
    setPendingAttachments((prev) => prev.filter((a) => a.localId !== localId));
  }, []);

  const removeExisting = useCallback((uid: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.uid !== uid));
  }, []);

  const getAttachmentUids = useCallback(
    () => pendingAttachments.filter((a) => a.status === 'registered' && a.uid).map((a) => a.uid!),
    [pendingAttachments]
  );

  const initialize = useCallback((attachments: FileAttachment[]) => {
    setExistingAttachments(attachments);
  }, []);

  return {
    pendingAttachments,
    existingAttachments,
    addFiles,
    removePending,
    removeExisting,
    getAttachmentUids,
    initialize,
    validationError,
    clearValidationError: () => setValidationError(null),
  };
}
