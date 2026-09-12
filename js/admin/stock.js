const stockContainer = document.getElementById('stock-container');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');

// Inputs Form
const fId = document.getElementById('form-id');
const fName = document.getElementById('form-name');
const fCategory = document.getElementById('form-category');
const fPrice = document.getElementById('form-price');
const fImage = document.getElementById('form-image');
const fDescription = document.getElementById('form-description');

function escapeStockHTML(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

let localProducts = [];

function renderStock(products) {
    if (!stockContainer) return;
    localProducts = products;
    if (products.length === 0) {
        stockContainer.innerHTML = `<p class="text-gray-400 text-center col-span-2 py-4">No hay productos en inventario.</p>`;
        return;
    }

    stockContainer.innerHTML = products.map(product => {
        const avail = product.is_available;
        return `
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm">
                <div class="flex gap-3 items-center">
                    ${product.image_url ? `<img src="${escapeStockHTML(product.image_url)}" class="w-12 h-12 object-cover rounded-lg bg-gray-900">` : ''}
                    <div class="truncate">
                        <h3 class="font-bold text-white text-sm truncate">${escapeStockHTML(product.name)}</h3>
                        <p class="text-xs text-gray-400 uppercase font-semibold">${escapeStockHTML(product.category)}</p>
                    </div>
                </div>
                <div class="flex gap-2 justify-between items-center pt-2 border-t border-gray-700/50">
                    <div class="flex gap-1">
                        <button onclick="editProduct('${product.id}')" class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-blue-400">📝 Editar</button>
                        <button onclick="deleteProduct('${product.id}')" class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-red-400">🗑️ Borrar</button>
                    </div>
                    <button onclick="toggleStock('${product.id}', ${!avail})" class="px-3 py-1.5 rounded-lg text-xs font-black transition
                        ${avail ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                        ${avail ? 'DISPONIBLE' : 'AGOTADO'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadStock() {
    if (!window.supabaseClient) return;
    
    try {
        const { data, error } = await window.supabaseClient.from('products').select('*').order('name');
        if (error) throw error; // Aquí forzamos el catch si hay error de lectura
        renderStock(data);
    } catch (err) {
        console.error("Error al cargar inventario:", err.message);
        if (stockContainer) stockContainer.innerHTML = `<p class="text-red-400 text-center col-span-2 py-4">Error al cargar datos. Verifica tu conexión.</p>`;
    }
}

async function toggleStock(id, newValue) {
    // Verificamos el 'error' que devuelve Supabase internamente
    const { error } = await window.supabaseClient.from('products')
        .update({ is_available: newValue, updated_at: new Date().toISOString() })
        .eq('id', id);
        
    if (error) {
        console.error("Error RLS/Auth:", error.message);
        alert("Acceso denegado: Tu sesión puede haber expirado. Recarga la página.");
        return;
    }
    
    loadStock();
}

// Operaciones del Formulario Modal (CRUD)
function openForm() {
    fId.value = ''; fName.value = ''; fCategory.value = ''; fPrice.value = ''; fImage.value = ''; fDescription.value = '';
    modalTitle.innerText = "Nuevo Producto";
    modalForm.classList.replace('hidden', 'flex');
}

function closeForm() { modalForm.classList.replace('flex', 'hidden'); }

function editProduct(id) {
    const p = localProducts.find(prod => prod.id === id);
    if (!p) return;
    fId.value = p.id; fName.value = p.name; fCategory.value = p.category; fPrice.value = p.price; fImage.value = p.image_url || ''; fDescription.value = p.description || '';
    modalTitle.innerText = "Editar Producto";
    modalForm.classList.replace('hidden', 'flex');
}

async function saveProduct() {
    const payload = {
        name: fName.value.trim(),
        category: fCategory.value.trim(),
        price: Number(fPrice.value),
        image_url: fImage.value.trim() || null,
        description: fDescription.value.trim() || null,
        updated_at: new Date().toISOString()
    };
    if (!payload.name || !payload.category || !payload.price) { alert('Completa los campos obligatorios'); return; }

    let opError = null;
    
    // Capturamos los errores de la API explícitamente
    if (fId.value) {
        const { error } = await window.supabaseClient.from('products').update(payload).eq('id', fId.value);
        opError = error;
    } else {
        const { error } = await window.supabaseClient.from('products').insert([payload]);
        opError = error;
    }
    
    if (opError) {
        console.error("Error al guardar:", opError.message);
        alert("No tienes permisos para guardar. Inicia sesión nuevamente.");
        return;
    }
    
    closeForm();
    loadStock();
}

async function deleteProduct(id) {
    if (confirm('¿Seguro que deseas eliminar este producto de la carta?')) {
        const { error } = await window.supabaseClient.from('products').delete().eq('id', id);
        
        if (error) {
            console.error("Error al eliminar:", error.message);
            alert("No tienes permisos para borrar. Inicia sesión nuevamente.");
            return;
        }
        
        loadStock();
    }
}

function initStock() {
    if (!window.supabaseClient) {
        console.error("No se encontró el cliente de Supabase en el panel de admin");
        return;
    }
    loadStock();
    // Previene múltiples suscripciones si la función se llama varias veces
    window.supabaseClient.removeAllChannels(); 
    window.supabaseClient.channel('admin:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { loadStock(); })
        .subscribe();
}