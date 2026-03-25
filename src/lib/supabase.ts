import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkyfukrembwtpkwihhbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_JsVDXPliJWkHFZYHCR4DXQ_KlA66ovL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // 👈 não salva a sessão
        autoRefreshToken: false,
    },
});