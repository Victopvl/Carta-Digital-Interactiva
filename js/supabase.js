// Inicializador de Supabase con CDN Global
if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
    console.error("Error crítico: La librería de Supabase no se cargó correctamente.");
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
