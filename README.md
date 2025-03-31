# @updatedev/ssr

Update clients for use in SSR frameworks.

## Overview

This package is designed for using the Update JavaScript library in server-side rendering frameworks.
It provides a framework-agnostic way of creating Update clients with Supabase authentication.

## Installation

```bash
npm install @updatedev/js @updatedev/ssr
```

## Usage

Please refer to the official Update documentation for the latest best practices on using this package in your SSR framework of choice.

### Browser Client

```typescript
import { createBrowserClient } from '@updatedev/ssr/supabase';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_UPDATE_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client

```typescript
import { createServerClient } from '@updatedev/ssr/supabase';
import { cookies } from 'next/headers'; // For Next.js

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_UPDATE_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookie handling implementation for your framework
      },
    }
  );
}
```

## License

MIT
