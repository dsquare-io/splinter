import {
  queryOptions,
  useInfiniteQuery,
  useQuery,
  type UndefinedInitialDataOptions,
} from '@tanstack/react-query';

import { ApiResponse, paths, urlWithArgs, type UrlArgs } from '@/api-types';
import { axiosInstance } from '@/axios.ts';

export function apiQueryOptions<Path extends keyof paths>(
  url: Path,
  args?: UrlArgs<Path>,
  params?: Partial<Record<string, string | number | undefined | string[]>>,
  options?: Partial<Omit<UndefinedInitialDataOptions<ApiResponse<Path>>, 'queryKey' | 'queryFn'>>
) {
  const resolvedUrl = urlWithArgs(url, args as any, params);
  const pathParts = resolvedUrl.split('?')[0].replace(/^\/+/g, '').replace(/\/+$/g, '').split('/');

  return queryOptions<ApiResponse<Path>>({
    ...(options as any),
    queryKey: [...pathParts, ...(params ? [params] : [])],
    queryFn: ({ signal }) =>
      axiosInstance.get(resolvedUrl, { signal }).then((r) => r.data as ApiResponse<Path>),
  });
}

export function useApiQuery<Path extends keyof paths>(
  url: Path,
  args?: UrlArgs<Path>,
  params?: Partial<Record<string, string | number | undefined | string[]>>
) {
  return useQuery(apiQueryOptions(url, args, params));
}

export function useInfiniteApiQuery<Path extends keyof paths>(
  url: Path,
  args?: UrlArgs<Path>,
  params?: Partial<Record<string, string | number | undefined | string[]>>
) {
  const basePathParts = urlWithArgs(url, args as any)
    .split('?')[0]
    .replace(/^\/+/g, '')
    .replace(/\/+$/g, '')
    .split('/');

  return useInfiniteQuery<ApiResponse<Path>, Error, ApiResponse<Path>[], unknown[], string | undefined>({
    queryKey: [...basePathParts, ...(params ? [params] : [])],
    queryFn: ({ pageParam, signal }) => {
      const cursorParams = pageParam ? { ...params, cursor: pageParam } : params;
      const resolvedUrl = urlWithArgs(url, args as any, cursorParams);
      return axiosInstance.get(resolvedUrl, { signal }).then((r) => r.data as ApiResponse<Path>);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
    select: (data) => data.pages,
  });
}
