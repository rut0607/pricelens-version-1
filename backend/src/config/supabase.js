const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:');
console.log('- URL present:', !!supabaseUrl);
console.log('- Anon Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ CRITICAL: Missing Supabase environment variables');
    console.error('Please check your .env file has:');
    console.error('1. SUPABASE_URL');
    console.error('2. SUPABASE_ANON_KEY');
    console.error('3. SUPABASE_SERVICE_ROLE_KEY (optional)');
    throw new Error('Missing Supabase environment variables');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ SUPABASE_URL must start with https://');
    throw new Error('Invalid Supabase URL format');
}

// Create client with timeout
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    },
    global: {
        fetch: (...args) => {
            console.log('Supabase fetch called with:', args[0]);
            return fetch(...args).catch(err => {
                console.error('Supabase fetch error:', err.message);
                throw err;
            });
        }
    }
});

// Test connection on startup
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1)
            .maybeSingle();
            
        if (error && error.code !== '42P01') { // 42P01 is "table doesn't exist"
            console.error('⚠️ Supabase connection warning:', error.message);
        } else {
            console.log('✅ Supabase client initialized successfully');
        }
    } catch (error) {
        console.error('⚠️ Could not verify Supabase connection:', error.message);
    }
}

testConnection();

module.exports = { supabase };