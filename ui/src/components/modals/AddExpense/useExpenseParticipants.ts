import { useFormContext } from 'react-hook-form';

import { useQuery } from '@tanstack/react-query';

import { ApiRoutes } from '@/api-types';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import useAuth from '@/hooks/useAuth.ts';

export interface Participant {
  uid: string;
  urn: string;
  name: string;
  initials?: string;
  type: 'group' | 'friend' | 'user';
}

export function useExpenseParticipants(): Participant[] {
  const { watch, getValues } = useFormContext();
  const { currentUser } = useAuth();

  const partipants = getValues('participants:del') as Participant[];
  const {data} = useApiQuery(ApiRoutes.PROFILE);
  watch('participants:del');

  const isGroup = partipants?.[0]?.type === 'group';

  const { data: groupDetail } = useQuery(
    apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: partipants?.[0]?.uid }, undefined, {
      enabled: isGroup,
    })
  );

  if (isGroup) {
    return (
      groupDetail?.members?.map((member) => ({
        uid: member.uid,
        urn: member.urn,
        name: member.fullName!,
        type: 'friend',
      })) ?? []
    );
  }

  const currentUserParticipants: Participant[] = currentUser
    ? [
        {
          uid: currentUser!.uid,
          urn: currentUser!.urn,
          initials: currentUser!.fullName,
          name: `Me (${currentUser!.fullName!})`,
          type: 'user',
        },
      ]
    : [];

  if (!partipants || partipants.length === 0) {
    return currentUserParticipants;
  }

  return [...currentUserParticipants, ...partipants];
}
