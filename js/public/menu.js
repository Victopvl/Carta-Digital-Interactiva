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
                    <h2 class="text-2xl font-bold mb-4">
                        ${escapeHTML(category)}
                    </h2>

                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        ${categoryProducts.map(product => `
                            <article class="bg-white rounded-2xl shadow-sm border p-5">
                                
                                <div class="flex justify-between gap-4">
                                    <div>
                                        <h3 class="font-semibold text-lg">
                                            ${escapeHTML(product.name)}
                                        </h3>

                                        ${
                                            product.description
                                                ? `
                                                    <p class="text-sm text-gray-500 mt-1">
                                                        ${escapeHTML(product.description)}
                                                    </p>
                                                  `
                                                : ''
                                        }
                                    </div>

                                    <span class="font-bold whitespace-nowrap">
                                        ${formatPrice(product.price)}
                                    </span>
                                </div>

                            </article>
                        `).join('')}
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
            <p class="text-gray-500">
                Cargando carta...
            </p>
        </div>
    `;

    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('name');

    if (error) {
        console.error('Error cargando productos:', error);

        menuContainer.innerHTML = `
            <div class="text-center py-10">
                <p class="text-red-500">
                    No se pudo cargar la carta.
                </p>
            </div>
        `;

        return;
    }

    renderMenu(data);
}

// ============================================
// REALTIME
// ============================================

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

// ============================================
// INITIAL LOAD
// ============================================

loadMenu();