import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function run() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('name, role');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User Profiles found:');
        data.forEach(u => console.log(` - ${u.name} (${u.role})`));
    }
}

run();
