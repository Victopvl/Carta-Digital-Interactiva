// Inicializador seguro de Supabase Local
(function() {
    // Verificamos si la librería cargó globalmente o bajo otro namespace
    const supabaseLib = window.supabase || window.supabaseJs;

    if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
        console.error("Error crítico: La librería local de Supabase no se cargó o no expone createClient.");
        const container = document.getElementById('menu-container');
        if (container) {
            container.innerHTML = `<p class="text-center text-red-500 font-bold py-20">Error de carga: Librería Supabase no disponible.</p>`;
        }
        return;
    }

    try {
        // Inicializamos el cliente global usando config.js
        window.supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase inicializado correctamente en entorno local.");
    } catch (err) {
        console.error("Error al ejecutar createClient:", err);
    }
})();