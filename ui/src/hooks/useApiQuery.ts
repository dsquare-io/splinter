import { paths, type UrlArgs, urlWithArgs } from '../api-types';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axios.ts';


export function apiQueryOptions<Path extends keyof paths>(url: Path, args: UrlArgs<Path>, params?: Partial<Record<string, string | number | undefined | string[]>>) {
  const resolvedUrl = urlWithArgs(url, args as any, params);
  const pathParts = resolvedUrl.split('?')[0].replace(/^\/+/g, '').replace(/\/+$/g, '').split('/');

  return queryOptions({
    queryKey: [...pathParts, ...params ? [params] : []],
    queryFn: ({ signal }) => axiosInstance.get(resolvedUrl, { signal }).then((r) => r.data),
  });
}

export function useApiQuery<Path extends keyof paths>(url: Path, args: UrlArgs<Path>, params?: Partial<Record<string, string | number | undefined | string[]>>) {
  return useQuery(apiQueryOptions(url, args, params));
}