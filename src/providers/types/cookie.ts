import { SerializeOptions } from "cookie";

export type GetAllCookies = () =>
  | Promise<{ name: string; value: string }[] | null>
  | { name: string; value: string }[]
  | null;

export type SetAllCookies = (
  cookies: {
    name: string;
    value: string;
    options: Partial<SerializeOptions>;
  }[],
) => Promise<void> | void;

export type CookieOptions = {
  getAll: GetAllCookies;
  setAll?: SetAllCookies;
};
