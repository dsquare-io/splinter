import { useNavigate } from '@tanstack/react-router';
import { isAxiosError } from 'axios';

export function useRedirectOn404(error: unknown, to: string) {
  const navigate = useNavigate();
  if (error && isAxiosError(error) && error.response?.status === 404) {
    void navigate({ to });
  }
}
