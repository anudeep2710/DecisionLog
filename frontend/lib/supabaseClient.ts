import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ibxrxncyjwnhyceqlzxk.supabase.co"
const supabaseAnonKey = "sb_publishable_x-2a-1EEWh0GVIMQl83yXQ_E1AF2H9w"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
