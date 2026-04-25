import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mflhqvhtpjvcoqgyboym.supabase.co"
const supabaseKey = "sb_publishable_GdFdxU9kpzHimRqxDD-Alw_6ZQ6rJKG"

export const supabase = createClient(supabaseUrl, supabaseKey)