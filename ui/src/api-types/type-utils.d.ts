import {paths} from './routeTypes';
import {VerbType} from './utils.ts';

export type VerbType = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type ApiResponse<
  Path extends keyof paths,
  Verb extends VerbType = 'get',
  StatusCode extends number = 200,
  ContentType extends string = 'application/json',
> = paths[Path][Verb]['responses'][StatusCode]['content'][ContentType];
