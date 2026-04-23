import useAuth from '@/hooks/useAuth.ts';
import { SimpleUser } from '../api-types';

type UserLabelProps = {
  user: SimpleUser;
  inline?: boolean;
};

export default function UserLabel({ user, inline = false }: UserLabelProps) {
  const { currentUser } = useAuth();

  if (currentUser?.uid === user.uid) {
    return inline ? 'you' : 'You';
  }

  return user.name;
}
