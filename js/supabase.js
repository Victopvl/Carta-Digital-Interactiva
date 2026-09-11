// ============================================
// CARTA DIGITAL INTERACTIVA
// Conector Oficial Supabase
// ============================================

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!supabaseClient) {
    console.error("Supabase no se ha cargado correctamente desde el CDN.");
} else {
    console.log("🚀 Cliente de Supabase inicializado con éxito.");
}
