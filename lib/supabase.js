import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('SUPABASE URL:', supabaseUrl)
console.log('SUPABASE KEY OK:', !!supabaseAnonKey)
console.log('SUPABASE KEY PREFIX:', supabaseAnonKey ? supabaseAnonKey.slice(0, 20) : 'sem-chave')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
