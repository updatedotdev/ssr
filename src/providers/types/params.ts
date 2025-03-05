import { CookieOptionsWithName } from "@supabase/ssr";
import { SupabaseClientOptions } from "@supabase/supabase-js";
import { GetAllCookies, SetAllCookies } from "./cookie";

export type CreateClientServerParams<SchemaName> = {
  cookies?: {
    getAll: GetAllCookies;
    setAll?: SetAllCookies;
  };
  supabase?: SupabaseClientOptions<SchemaName> & {
    cookieOptions?: CookieOptionsWithName;
    cookieEncoding?: "raw" | "base64url";
  };
};

export type CreateClientBrowserParams<SchemaName> = {
  cookies?: {
    getAll: GetAllCookies;
    setAll: SetAllCookies;
  };
  supabase?: SupabaseClientOptions<SchemaName> & {
    cookieOptions?: CookieOptionsWithName;
    cookieEncoding?: "raw" | "base64url";
    isSingleton?: boolean;
  };
};
