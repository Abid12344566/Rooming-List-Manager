import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pgncyngqjgrioeocuxip.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ REACT_APP_SUPABASE_KEY is not set in environment variables');
}

// Create Supabase client for React
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Frontend Supabase client initialized');
console.log('🌐 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set');

export { supabase }; 