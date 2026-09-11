// Conector oficial limpio
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!supabaseClient) {
    console.error("Supabase no se ha cargado correctamente desde el CDN.");
}
