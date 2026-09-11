// Inicialización limpia forzada desde el archivo del proyecto local
const supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

if (!supabaseClient) {
    console.warn("Inicializando cliente en modo local autónomo.");
}
