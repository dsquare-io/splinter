import { useQuery } from '@tanstack/react-query';

import { ApiRoutes } from '@/api-types';
import { apiQueryOptions } from '@/hooks/useApiQuery';

export function useAttachmentConfig() {
  const { data } = useQuery({
    ...apiQueryOptions(ApiRoutes.ATTACHMENT_CONFIG),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return data || {};
}
