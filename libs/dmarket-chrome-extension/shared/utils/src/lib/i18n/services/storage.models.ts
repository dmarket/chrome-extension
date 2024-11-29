export const request = 'request';

export interface IStorage {
  readonly SUPPORTED: boolean;

  set(key: string, data: string, options?: object): void;

  get(key: string): string | null;

  remove(key: string, options?: object): void;
}

export interface IStorageOptions {
  expires?: number;
  path?: string;
}

export interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: CookieExpires;
}

export type CookieExpires = string | Date | number | undefined;
