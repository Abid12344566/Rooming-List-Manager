require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://pgncyngqjgrioeocuxip.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_KEY is not set in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized');
console.log('🌐 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set');

module.exports = { supabase }; 