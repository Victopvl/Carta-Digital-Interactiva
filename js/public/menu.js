// ============================================
// CARTA DIGITAL INTERACTIVA
// Public Menu
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
            <div class="text-center py-10">
                <p class="text-gray-500">
                    No hay productos disponibles.
                </p>
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
                <section class="mb-10">
                    <h2 class="text-2xl font-bold mb-4 text-gray-900">
                        ${escapeHTML(category)}
                    </h2>

                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        ${categoryProducts.map(product => {
                            // Detectamos si el producto está disponible o no
                            const isAvailable = product.is_available;

                            return `
                                <article class="bg-white rounded-2xl shadow-sm border p-5 transition-all ${!isAvailable ? 'opacity-50 bg-gray-50' : ''}">
                                    
                                    <div class="flex justify-between gap-4">
                                        <div class="text-left">
                                            <h3 class="font-semibold text-lg ${!isAvailable ? 'text-gray-400 line-through' : 'text-gray-900'}">
                                                ${escapeHTML(product.name)}
                                            </h3>

                                            ${
                                                product.description
                                                    ? `
                                                        <p class="text-sm text-gray-400 mt-1">
                                                            ${escapeHTML(product.description)}
                                                        </p>
                                                      `
                                                    : ''
                                            }
                                        </div>

                                        <div class="text-right flex flex-col items-end justify-between gap-2">
                                            <span class="font-bold whitespace-nowrap ${!isAvailable ? 'text-gray-400' : 'text-gray-900'}">
                                                ${formatPrice(product.price)}
                                            </span>
                                            
                                            <!-- Etiqueta visual si el plato no tiene stock -->
                                            ${!isAvailable 
                                                ? `<span class="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Agotado</span>` 
                                                : ''
                                            }
                                        </div>
                                    </div>

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
        <div class="text-center py-10">
            <p class="text-gray-500 animate-pulse">
                Cargando carta...
            </p>
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category')
            .order('name');

        if (error) {
            console.error('Error cargando productos desde Supabase:', error);

            menuContainer.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-red-500 font-medium">
                        No se pudo cargar la carta.
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                        Verifica las políticas RLS en Supabase.
                    </p>
                </div>
            `;
            return;
        }

        renderMenu(data);
    } catch (err) {
        console.error('Excepción atrapada al cargar menú:', err);
    }
}

// ============================================
// INITIALIZATION & REALTIME
// ============================================

function init() {
    // Verificación de seguridad indispensable
    if (!supabaseClient) {
        console.error("El cliente de Supabase no está listo. Abortando inicialización.");
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-red-500 font-medium">Error de conexión con la base de datos.</p>
                    <p class="text-xs text-gray-400 mt-1">El cliente de Supabase no se inicializó correctamente.</p>
                </div>
            `;
        }
        return;
    }

    // Carga inicial de los platos
    loadMenu();

    // Suscripción segura en tiempo real
    supabaseClient
        .channel('public:products')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'products'
            },
            () => {
                loadMenu();
            }
        )
        .subscribe();
}

// Ejecutamos la inicialización segura al cargar el script
init();
