import {useFormContext} from 'react-hook-form';

import {useQueries} from '@tanstack/react-query';

import {ApiResponse} from '@/api-types';
import {Paths} from '@/api-types/routePaths.ts';
import {apiQueryOptions} from '@/hooks/useApiQuery.ts';

export interface Participant {
  id: string;
  uid: string;
  urn: string;
  name: string;
  type: 'group' | 'friend';
}

export function useExpenseParticipants() {
  const {watch, getValues} = useFormContext();
  const partipants = getValues('del:participants') as Participant[];
  watch('del:participants');

  const results = useQueries({
    queries: partipants?.map((partipant) => {
      if (partipant.type) return apiQueryOptions(Paths.GROUP_DETAIL, {group_uid: partipant.uid}) as any;
      return apiQueryOptions(Paths.FRIEND_DETAIL, {friend_uid: partipant.uid}) as any;
    }) ?? [],
  });

  return results?.flatMap((result) => {
    if (!result.data) return [];

    if ((result.data as { urn: string }).urn.includes('group')) {
      const groupData = result.data as ApiResponse<typeof Paths.GROUP_DETAIL>;
      return groupData.members;
    }

    if ((result.data as { urn: string }).urn.includes('user')) {
      return result.data as ApiResponse<typeof Paths.FRIEND_DETAIL>;
    }
    return [];
  });
}
