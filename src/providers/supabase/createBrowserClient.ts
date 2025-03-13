// Keep this file in sync with https://github.com/supabase/ssr/blob/main/src/createBrowserClient.ts

import {
  createClient,
  UpdateSupabaseClient,
  UpdateSupabaseClientOptions,
} from '@updatedev/js/supabase';
import { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  CookieOptionsWithName,
  GetAllCookies,
  SetAllCookies,
} from '@supabase/ssr';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import { createStorageFromOptions } from '@supabase/ssr/dist/main/cookies';
import { VERSION } from '@supabase/ssr/dist/main/version';
import { isBrowser } from '@supabase/ssr/dist/main/utils';

let cachedBrowserClient: UpdateSupabaseClient<any, any, any> | undefined;

export const createBrowserClient = <
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(
  updateApiKey: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: {
    cookies?: {
      getAll: GetAllCookies;
      setAll: SetAllCookies;
    };
    update?: UpdateSupabaseClientOptions;
    supabase?: SupabaseClientOptions<SchemaName> & {
      cookieOptions?: CookieOptionsWithName;
      cookieEncoding?: 'raw' | 'base64url';
      isSingleton?: boolean;
    };
  }
): UpdateSupabaseClient<Database, SchemaName, Schema> => {
  // singleton client is created only if isSingleton is set to true, or if isSingleton is not defined and we detect a browser
  const shouldUseSingleton =
    options?.supabase?.isSingleton === true ||
    ((!options?.supabase || !('isSingleton' in (options.supabase || {}))) &&
      isBrowser());

  if (shouldUseSingleton && cachedBrowserClient) {
    return cachedBrowserClient;
  }

  if (!updateApiKey) {
    throw new Error('An Update API Key is required');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('A Supabase URL and Anon Key are required');
  }

  const { storage } = createStorageFromOptions(
    {
      cookies: options?.cookies,
      cookieOptions: options?.supabase?.cookieOptions,
      cookieEncoding: options?.supabase?.cookieEncoding ?? 'base64url',
    },
    false
  );

  const supabaseOptions: SupabaseClientOptions<SchemaName> = {
    ...options?.supabase,
    global: {
      ...options?.supabase?.global,
      headers: {
        ...options?.supabase?.global?.headers,
        'X-Client-Info': `supabase-ssr/${VERSION} createBrowserClient`,
      },
    },
    auth: {
      ...options?.supabase?.auth,
      ...(options?.supabase?.cookieOptions?.name
        ? { storageKey: options.supabase.cookieOptions.name }
        : null),
      flowType: 'pkce',
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
      persistSession: true,
      storage,
    },
  };

  const client = createClient<Database, SchemaName, Schema>(
    updateApiKey,
    supabaseUrl,
    supabaseAnonKey,
    {
      update: options?.update,
      storage: {
        getAll: options?.cookies?.getAll,
        setAll: options?.cookies?.setAll,
      },
      supabase: supabaseOptions,
    }
  );

  if (shouldUseSingleton) {
    cachedBrowserClient = client;
  }

  return client;
};
