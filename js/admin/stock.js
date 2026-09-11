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
            <p class="text-gray-500">
                No hay productos registrados.
            </p>
        `;

        return;
    }

    stockContainer.innerHTML = products.map(product => {
        const available = product.is_available;

        return `
            <div class="flex items-center justify-between gap-4 
                        bg-white border rounded-xl p-4">

                <div>
                    <h3 class="font-semibold">
                        ${escapeStockHTML(product.name)}
                    </h3>

                    <p class="text-sm text-gray-500">
                        ${escapeStockHTML(product.category)}
                    </p>
                </div>

                <button
                    type="button"
                    onclick="toggleStock('${product.id}', ${!available})"
                    class="px-4 py-2 rounded-lg font-semibold transition
                    ${available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
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

    stockContainer.innerHTML = `
        <p class="text-gray-500">
            Cargando inventario...
        </p>
    `;

    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('category')
        .order('name');

    if (error) {
        console.error('Error cargando inventario:', error);

        stockContainer.innerHTML = `
            <p class="text-red-500">
                No se pudo cargar el inventario.
            </p>
        `;

        return;
    }

    renderStock(data);
}

async function toggleStock(id, newValue) {
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
}

// ============================================
// REALTIME
// ============================================

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