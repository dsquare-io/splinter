import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ApiRoutes, type AttachmentConfig } from '@/api-types';
import { apiQueryOptions } from '@/hooks/useApiQuery';

export function useAttachmentConfig(): AttachmentConfig {
  const { data } = useQuery({
    ...apiQueryOptions(ApiRoutes.ATTACHMENT_CONFIG),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return useMemo(() => {
    if (!data) {
      return {
        maxFileSize: Infinity,
        allowedContentTypes: [],
        allowedExtensions: [],
      };
    }

    return {
      maxFileSize: data.maxFileSize,
      allowedContentTypes: [...data.allowedContentTypes, 'image/heic', 'image/heif'],
      allowedExtensions: [...data.allowedExtensions, '.heic', '.heif'],
    };
  }, [data]);
}
