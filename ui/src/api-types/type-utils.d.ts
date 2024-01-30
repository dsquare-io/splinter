import {paths} from './routeTypes';
import {VerbType} from './utils.ts';

export type VerbType = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type ApiResponse<
  Path extends keyof paths,
  Verb extends VerbType = 'get',
  ContentType extends string = 'application/json',
  StatusCode extends number = 200,
> = paths[Path][Verb]['responses'][StatusCode]['content'][ContentType];
