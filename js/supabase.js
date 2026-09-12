// Inicializador seguro de Supabase
const supabaseUrl = window.SUPABASE_URL;
const supabaseKey = window.SUPABASE_ANON_KEY;

if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
    console.error("Error crítico: La librería de Supabase no se cargó correctamente.");
} else if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("tu-proyecto")) {
    console.error("Error crítico: Faltan configurar las credenciales reales en js/config.js");
} else {
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
}
