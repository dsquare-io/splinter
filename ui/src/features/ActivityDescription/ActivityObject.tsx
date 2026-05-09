import { Object_ } from '@/api-types';
import { useAuth } from '@/hooks/useAuth';
import { parseUrn } from './urnParser';

type ActivityObjectProps = {
  object: Object_;
};

export function ActivityObject({ object }: ActivityObjectProps) {
  const { currentUser } = useAuth();
  const parsed = parseUrn(object.urn);

  switch (parsed?.modelType) {
    case 'user':
      return <span className="font-semibold">{currentUser?.uid === object.uid ? 'you' : object.value}</span>;
    case 'expense':
      return <span className="font-medium">{object.value}</span>;
    case 'activity:comment': {
      const trimmed = object.value.length > 32 ? `${object.value.slice(0, 32)}…` : object.value;
      return <span className="italic">"{trimmed}"</span>;
    }
    default:
      return <>{object.value}</>;
  }
}
