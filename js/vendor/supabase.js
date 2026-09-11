// Validar que la librería de Supabase se cargó desde el vendor
if (!window.supabase) {
    console.error("Error crítico: La librería local de Supabase no se cargó.");
    document.getElementById('menu-container').innerHTML = `<p class="text-center text-red-500 font-bold py-20">Error interno del sistema (Librería faltante).</p>`;
} else {
    // SUPABASE_URL y SUPABASE_ANON_KEY deben existir en tu archivo js/config.js
    const { createClient } = window.supabase;
    
    // Crear el cliente y hacerlo global para que menu.js y stock.js lo puedan usar
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}