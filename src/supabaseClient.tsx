import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bcqrezetbqornuuadcer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcXJlemV0YnFvcm51dWFkY2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDMyNzgsImV4cCI6MjA1MTA3OTI3OH0.FhVOfZxxfUP_1UexEgbFhPlhGiBh81GTJEjIH6QmfxU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
