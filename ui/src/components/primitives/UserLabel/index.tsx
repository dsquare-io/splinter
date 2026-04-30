import { SimpleUser } from '@/api-types';
import { useAuth } from '@/hooks/useAuth.ts';

type UserLabelProps = {
  user: SimpleUser;
  inline?: boolean;
};

export function UserLabel({ user, inline = false }: UserLabelProps) {
  const { currentUser } = useAuth();

  if (currentUser?.uid === user.uid) {
    return inline ? 'you' : 'You';
  }

  return user.name;
}
