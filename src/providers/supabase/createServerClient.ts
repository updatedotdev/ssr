// Keep this file in sync with https://github.com/supabase/ssr/blob/main/src/createServerClient.ts

import {
  createClient,
  UpdateSupabaseClient,
  UpdateSupabaseClientOptions,
} from '@updatedev/js/supabase';
import { AuthChangeEvent, SupabaseClientOptions } from '@supabase/supabase-js';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import {
  applyServerStorage,
  createStorageFromOptions,
} from '@supabase/ssr/dist/main/cookies';
import { VERSION } from '@supabase/ssr/dist/main/version';
import {
  CookieOptionsWithName,
  GetAllCookies,
  SetAllCookies,
} from '@supabase/ssr';

type CreateServerClientOptions<SchemaName> =
  UpdateSupabaseClientOptions<SchemaName> & {
    cookies?: {
      getAll: GetAllCookies;
      setAll?: SetAllCookies;
    };
    supabase?: SupabaseClientOptions<SchemaName> & {
      cookieOptions?: CookieOptionsWithName;
      cookieEncoding?: 'raw' | 'base64url';
    };
  };

export const createServerClient = <
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
  options?: CreateServerClientOptions<SchemaName>
): UpdateSupabaseClient<Database, SchemaName, Schema> => {
  if (!updateApiKey) {
    throw new Error('An Update API Key is required');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('A Supabase URL and Anon Key are required');
  }

  const { storage, getAll, setAll, setItems, removedItems } =
    createStorageFromOptions(
      {
        cookies: options?.cookies,
        cookieOptions: options?.supabase?.cookieOptions,
        cookieEncoding: options?.supabase?.cookieEncoding ?? 'base64url',
      },
      true
    );

  const supabaseOptions: SupabaseClientOptions<SchemaName> = {
    ...options?.supabase,
    global: {
      ...options?.supabase?.global,
      headers: {
        ...options?.supabase?.global?.headers,
        'X-Client-Info': `supabase-ssr/${VERSION} createServerClient`,
      },
    },
    auth: {
      ...(options?.supabase?.auth?.storageKey
        ? { storageKey: options.supabase.auth.storageKey }
        : null),
      ...options?.supabase?.auth,
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storage,
    },
  };

  // const storage = new Storage

  const client = createClient<Database, SchemaName, Schema>(
    updateApiKey,
    supabaseUrl,
    supabaseAnonKey,
    {
      ...options,
      storage: {
        getAll: options?.cookies?.getAll,
        setAll: options?.cookies?.setAll,
      },
      supabase: supabaseOptions,
    }
  );

  client.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
    // The SIGNED_IN event is fired very often, but we don't need to
    // apply the storage each time it fires, only if there are changes
    // that need to be set -- which is if setItems / removeItems have
    // data.
    const hasStorageChanges =
      Object.keys(setItems).length > 0 || Object.keys(removedItems).length > 0;

    if (
      hasStorageChanges &&
      (event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_OUT' ||
        event === 'MFA_CHALLENGE_VERIFIED')
    ) {
      await applyServerStorage(
        { getAll, setAll, setItems, removedItems },
        {
          cookieOptions: options?.supabase?.cookieOptions ?? null,
          cookieEncoding: options?.supabase?.cookieEncoding ?? 'base64url',
        }
      );
    }
  });

  return client;
};
