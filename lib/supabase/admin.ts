import { createClient } from '@supabase/supabase-js';

// This file must ONLY be imported and executed in server environments (Server Actions / Route Handlers)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Safe on the server, never expose to front-end!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);