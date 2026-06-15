import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react';

import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { ApiRoutes, type SimpleUser } from '@/api-types';
import { Expense, Friend, Group } from '@/api-types/components/schemas';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';

export interface Participant {
  uid: string;
  urn: string;
  name: string;
  user?: SimpleUser;
  type: 'group' | 'friend';
}

type ParticipantsAction =
  | { type: 'select_group'; data: Group }
  | { type: 'select_friend'; data: Friend }
  | { type: 'remove'; urn: string };

function participantsReducer(state: Participant[], action: ParticipantsAction): Participant[] {
  if (action.type === 'remove') return state.filter((p) => p.urn !== action.urn);
  if (action.type === 'select_group') {
    return [{ type: 'group', uid: action.data.uid, urn: action.data.urn, name: action.data.name }];
  }
  if (action.type === 'select_friend') {
    const participant: Participant = {
      type: 'friend',
      uid: action.data.uid,
      urn: action.data.urn,
      name: action.data.name,
      user: action.data,
    };

    if (state[0]?.type === 'group') {
      return [participant];
    }
    if (!state.find((p) => p.urn === action.data.urn)) {
      return [...state, participant];
    }
  }
  return state;
}

interface ParticipantsContextValue {
  selected: Participant[];
  participants: SimpleUser[];
  hasPreselected: boolean;
  groupLocked: boolean;
  dispatch: Dispatch<ParticipantsAction>;
}

const ParticipantsContext = createContext<ParticipantsContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
  initialExpense?: Expense;
}

export function ExpenseParticipantsProvider({ children, initialExpense }: ProviderProps) {
  const { currentUser } = useAuth();
  const params = useParams({ strict: false }) as { friend?: string; group?: string };
  const { data: groups } = useApiQuery(ApiRoutes.GROUP_LIST);
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);

  const [selected, dispatch] = useReducer(participantsReducer, [] as Participant[]);
  const initialized = useRef(false);

  const hasPreselected = !!params.friend || !!params.group;
  const groupLocked = !!initialExpense?.group;

  useEffect(() => {
    if (initialized.current) return;
    if (!groups || !friends) return;

    if (initialExpense) {
      initialized.current = true;
      if (initialExpense.group) {
        const group = groups.find((g) => g.uid === initialExpense.group);
        if (group) dispatch({ type: 'select_group', data: group });
      } else {
        const sharedUserUids = new Set(initialExpense.expenses.flatMap((e) => e.shares.map((s) => s.user)));
        sharedUserUids.add(initialExpense.paidBy.uid);
        sharedUserUids.delete(currentUser!.uid);
        for (const uid of sharedUserUids) {
          const friend = friends.find((f) => f.uid === uid);
          if (friend) dispatch({ type: 'select_friend', data: friend });
        }
      }
      return;
    }

    // URL-param pre-selection (create mode only)
    const friend = friends?.find((f) => f.uid === params.friend);
    const group = groups?.find((g) => g.uid === params.group);
    if (friend || group) initialized.current = true;
    if (friend) dispatch({ type: 'select_friend', data: friend });
    else if (group) dispatch({ type: 'select_group', data: group });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!friends, !!groups]);

  const isGroup = selected[0]?.type === 'group';
  const { data: groupDetail } = useQuery(
    apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: selected[0]?.uid }, undefined, {
      enabled: isGroup,
    })
  );

  const currentUserParticipant: SimpleUser[] = currentUser ? [currentUser] : [];

  const participants: SimpleUser[] = isGroup
    ? (groupDetail?.members ?? [])
    : [...currentUserParticipant, ...(selected.map((p) => p.user!) as SimpleUser[])];

  return (
    <ParticipantsContext.Provider value={{ selected, participants, hasPreselected, groupLocked, dispatch }}>
      {children}
    </ParticipantsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useParticipantsContext() {
  const ctx = useContext(ParticipantsContext);
  if (!ctx) throw new Error('useParticipantsContext used outside ExpenseParticipantsProvider');
  return ctx;
}
