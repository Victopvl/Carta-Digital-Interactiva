// ============================================
// CARTA DIGITAL INTERACTIVA
// Public Menu - UX & Responsive Optimized
// ============================================

const menuContainer = document.getElementById('menu-container');

function formatPrice(price) {
    return Number(price).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });
}

function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function renderMenu(products) {
    if (!menuContainer) return;

    if (!products || products.length === 0) {
        menuContainer.innerHTML = `
            <div class="text-center py-16 px-4 max-w-sm mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm mt-8">
                <div class="text-4xl mb-3">☕</div>
                <p class="text-gray-500 font-medium">No hay productos disponibles por el momento.</p>
                <p class="text-xs text-gray-400 mt-1">Vuelve a revisar nuestra carta más tarde.</p>
            </div>
        `;
        return;
    }

    const categories = {};
    products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });

    menuContainer.innerHTML = Object.entries(categories)
        .map(([category, categoryProducts]) => {
            return `
                <section class="mb-12">
                    <!-- Categoría con diseño flotante y barra decorativa inferior -->
                    <div class="flex items-center gap-3 mb-6 sticky top-0 bg-gray-50/90 backdrop-blur-md py-2 z-10">
                        <h2 class="text-xl font-extrabold text-gray-900 tracking-tight uppercase text-xs sm:text-sm bg-gray-900 text-white px-3 py-1 rounded-lg">
                            ${escapeHTML(category)}
                        </h2>
                        <div class="h-[1px] bg-gray-200 flex-1"></div>
                    </div>

                    <!-- Layout Adaptativo: 1 col en móvil, 2 en tablet, 3 en desktop -->
                    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        ${categoryProducts.map(product => {
                            const isAvailable = product.is_available;

                            return `
                                <article class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${!isAvailable ? 'opacity-55 bg-gray-50/70 select-none' : ''}">
                                    
                                    <div class="flex justify-between items-start gap-4 mb-3">
                                        <div class="space-y-1">
                                            <h3 class="font-bold text-gray-900 text-lg tracking-tight ${!isAvailable ? 'text-gray-400 line-through' : ''}">
                                                ${escapeHTML(product.name)}
                                            </h3>
                                            ${product.description ? `
                                                <p class="text-sm text-gray-500 leading-relaxed max-w-[240px] md:max-w-none">
                                                    ${escapeHTML(product.description)}
                                                </p>
                                            ` : ''}
                                        </div>

                                        <span class="font-extrabold text-base tracking-tight whitespace-nowrap bg-gray-100 text-gray-800 px-2.5 py-1 rounded-xl ${!isAvailable ? 'text-gray-400 bg-gray-200/50 line-through' : ''}">
                                            ${formatPrice(product.price)}
                                        </span>
                                    </div>

                                    <!-- Indicador dinámico de Stock -->
                                    ${!isAvailable ? `
                                        <div class="mt-2 self-start">
                                            <span class="inline-flex items-center gap-1 text-[11px] font-black bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
                                                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                Agotado por hoy
                                            </span>
                                        </div>
                                    ` : ''}

                                </article>
                            `;
                        }).join('')}
                    </div>
                </section>
            `;
        })
        .join('');
}

async function loadMenu() {
    if (!menuContainer) return;

    menuContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-gray-500 font-semibold tracking-wide uppercase animate-pulse-subtle">Sincronizando menú...</p>
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category')
            .order('name');

        if (error) {
            console.error('Error Supabase:', error);
            renderErrorState('Error al conectar con la base de datos.');
            return;
        }

        renderMenu(data);
    } catch (err) {
        console.error('Exception:', err);
        renderErrorState('Error crítico de red.');
    }
}

function renderErrorState(message) {
    if (!menuContainer) return;
    menuContainer.innerHTML = `
        <div class="text-center py-12 px-4 max-w-sm mx-auto bg-red-50 rounded-2xl border border-red-100 shadow-sm mt-8">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-red-700 font-bold text-base">Hubo un problema</p>
            <p class="text-xs text-red-500 mt-1">${escapeHTML(message)}</p>
            <button onclick="loadMenu()" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">Reintentar Conexión</button>
        </div>
    `;
}

// ============================================
// INITIALIZATION & REALTIME
// ============================================

function init() {
    if (!supabaseClient) {
        renderErrorState('El cliente de Supabase no se cargó correctamente.');
        return;
    }

    loadMenu();

    supabaseClient
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
            loadMenu();
        })
        .subscribe();
}

init();
