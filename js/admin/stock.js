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

// 1. Datalist ramaddii (categories) addatti calalee heddummina malee qulqulleessu
function updateCategoryDatalist(products) {
    const datalist = document.getElementById('categories-list');
    if (!datalist || !products) return;

    const categories = [...new Set(products
        .map(p => p.category ? p.category.trim().toUpperCase() : '')
        .filter(c => c !== '')
    )].sort();

    datalist.innerHTML = categories
        .map(cat => `<option value="${escapeStockHTML(cat)}">`)
        .join('');
}

function renderStock(products) {
    if (!stockContainer) return;
    localProducts = products;

    // Actualiza el datalist de categorías automáticamente
    if (typeof updateCategoryDatalist === 'function') {
        updateCategoryDatalist(products);
    }

    if (products.length === 0) {
        stockContainer.innerHTML = `<p class="text-stone-400 text-center col-span-2 py-4">No hay productos en inventario.</p>`;
        return;
    }

    stockContainer.innerHTML = products.map(product => {
        const avail = product.is_available;
        return `
            <div class="bg-white border border-stone-200/60 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm">
                <div class="flex gap-3 items-center">
                    ${product.image_url ? `<img src="${escapeStockHTML(product.image_url)}" class="w-12 h-12 object-cover rounded-lg bg-stone-100 flex-shrink-0">` : ''}
                    <div class="truncate">
                        <h3 class="font-bold text-stone-800 text-sm truncate">${escapeStockHTML(product.name)}</h3>
                        <p class="text-xs text-stone-400 uppercase font-semibold">${escapeStockHTML(product.category)}</p>
                    </div>
                </div>
                <div class="flex gap-2 justify-between items-center pt-2 border-t border-stone-100">
                    <div class="flex gap-1">
                        <button onclick="editProduct('${product.id}')" class="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/60 rounded-lg text-xs font-semibold text-stone-600 transition-colors">📝 Editar</button>
                        <button onclick="deleteProduct('${product.id}')" class="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/60 rounded-lg text-xs font-semibold text-stone-600 transition-colors">🗑️ Borrar</button>
                    </div>
                    <button onclick="toggleStock('${product.id}', ${!avail})" class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors
                        ${avail ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}">
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
        if (error) throw error;
        renderStock(data);
    } catch (err) {
        console.error("Error al cargar inventario:", err.message);
        if (stockContainer) stockContainer.innerHTML = `<p class="text-red-400 text-center col-span-2 py-4">Error al cargar datos. Verifica tu conexión.</p>`;
    }
}

async function toggleStock(id, newValue) {
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

// 2. saveProduct() ramaddii gara QUBEE GURDAATTI (UPPERCASE) jijjiiree olkaawa
async function saveProduct() {
    const payload = {
        name: fName.value.trim(),
        category: fCategory.value.trim().toUpperCase(),
        price: Number(fPrice.value),
        image_url: fImage.value.trim() || null,
        description: fDescription.value.trim() || null,
        updated_at: new Date().toISOString()
    };
    if (!payload.name || !payload.category || !payload.price) { alert('Completa los campos obligatorios'); return; }

    let opError = null;
    
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
    window.supabaseClient.removeAllChannels(); 
    window.supabaseClient.channel('admin:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { loadStock(); })
        .subscribe();
}