// Inicializador de Supabase
if (typeof window.supabase === 'undefined') {
    console.error("Error crítico: La librería local de Supabase no se cargó correctamente.");
} else {
    const { createClient } = window.supabase;
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}