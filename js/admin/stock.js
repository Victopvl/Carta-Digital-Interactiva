// ============================================
// CARTA DIGITAL INTERACTIVA
// Admin Stock
// ============================================

const stockContainer = document.getElementById('stock-container');

function escapeStockHTML(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function renderStock(products) {
    if (!stockContainer) return;

    if (!products || products.length === 0) {
        stockContainer.innerHTML = `
            <p class="text-gray-400 text-center py-4">
                No hay productos registrados.
            </p>
        `;
        return;
    }

    stockContainer.innerHTML = products.map(product => {
        const available = product.is_available;

        return `
            <div class="flex items-center justify-between gap-4 
                        bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

                <div class="text-left">
                    <!-- Forzamos text-gray-900 para que el nombre sea negro e invisible sobre blanco -->
                    <h3 class="font-bold text-gray-900 text-base">
                        ${escapeStockHTML(product.name)}
                    </h3>
                    <!-- Forzamos text-gray-500 para la categoría en gris oscuro -->
                    <p class="text-xs font-medium text-gray-500 mt-0.5">
                        ${escapeStockHTML(product.category)}
                    </p>
                </div>

                <button
                    type="button"
                    onclick="toggleStock('${product.id}', ${!available})"
                    class="px-4 py-2 rounded-lg font-bold text-xs transition whitespace-nowrap
                    ${available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }"
                >
                    ${available ? 'DISPONIBLE' : 'AGOTADO'}
                </button>

            </div>
        `;
    }).join('');
}


async function loadStock() {
    if (!stockContainer) return;

    // Validación preventiva de conexión
    if (!supabaseClient) {
        stockContainer.innerHTML = `<p class="text-red-400 text-center">Error: Cliente Supabase no inicializado.</p>`;
        return;
    }

    stockContainer.innerHTML = `
        <p class="text-gray-400 text-center py-4 animate-pulse">
            Cargando inventario...
        </p>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category')
            .order('name');

        if (error) {
            console.error('Error cargando inventario:', error);
            stockContainer.innerHTML = `
                <p class="text-red-400 text-center">
                    No se pudo cargar el inventario.
                </p>
            `;
            return;
        }

        renderStock(data);
    } catch (err) {
        console.error('Excepción al cargar stock:', err);
    }
}

async function toggleStock(id, newValue) {
    if (!supabaseClient) return;

    try {
        const { error } = await supabaseClient
            .from('products')
            .update({
                is_available: newValue,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando stock:', error);
            alert('No se pudo actualizar el producto.');
            return;
        }

        await loadStock();
    } catch (err) {
        console.error('Excepción al actualizar stock:', err);
    }
}

// ============================================
// REALTIME & INITIALIZATION
// ============================================

function initStock() {
    if (!supabaseClient) {
        console.error("Supabase no está disponible para el panel de administración.");
        return;
    }

    // Carga los productos por primera vez
    loadStock();

    // Activa la escucha en tiempo real
    supabaseClient
        .channel('admin:products')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'products'
            },
            () => {
                loadStock();
            }
        )
        .subscribe();
}
