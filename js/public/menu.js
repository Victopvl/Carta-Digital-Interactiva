const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const categoriesFilter = document.getElementById('categories-filter');

let globalProducts = [];
let activeCategory = 'TODOS';

function formatPrice(price) {
    return Number(price).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function renderFilterButtons() {
    if (!categoriesFilter) return;
    const categories = ['TODOS', ...new Set(globalProducts.map(p => p.category.toUpperCase().trim()))];
    
    categoriesFilter.innerHTML = categories.map(cat => `
        <button onclick="setCategory('${cat}')" class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap
            ${activeCategory === cat 
                ? 'bg-stone-900 text-white shadow-sm' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}\">
            ${escapeHTML(cat)}
        </button>
    `).join('');
}

function setCategory(category) {
    activeCategory = category;
    renderFilterButtons();
    filterProducts();
}

function filterProducts() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const filtered = globalProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(query) || (product.description && product.description.toLowerCase().includes(query));
        const matchesCategory = activeCategory === 'TODOS' || product.category.toUpperCase().trim() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    renderMenu(filtered);
}

function renderMenu(products) {
    if (!menuContainer) return;
    if (products.length === 0) {
        menuContainer.innerHTML = `<div class="text-center py-16 text-stone-400 font-medium">No se encontraron productos coincidentes.</div>`;
        return;
    }

    const categories = {};
    products.forEach(p => {
        const catUpper = p.category.toUpperCase().trim();
        if (!categories[catUpper]) categories[catUpper] = [];
        categories[catUpper].push(p);
    });

    const placeholderSVG = `
        <div style="width: 80px !important; height: 80px !important;" class="rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
            </svg>
        </div>`;

    menuContainer.innerHTML = Object.entries(categories)
        .map(([category, catProducts]) => `
            <section class="mb-10">
                <h2 class="text-xs font-black tracking-widest text-stone-400 uppercase mb-4 flex items-center gap-2">
                    <span>${escapeHTML(category)}</span>
                    <span class="h-[1px] bg-stone-200 flex-1"></span>
                </h2>
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    ${catProducts.map(product => {
                        const avail = product.is_available;
                        const hasImage = product.image_url && product.image_url.trim() !== '';

                        return `
                            <article class="bg-white rounded-2xl border border-stone-100 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 flex gap-4 items-center relative overflow-hidden ${!avail ? 'opacity-50 select-none' : ''}">
                                ${hasImage 
                                    ? `<img src="${escapeHTML(product.image_url)}" loading="lazy" class="w-20 h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0 ${!avail ? 'grayscale' : ''}">` 
                                    : placeholderSVG}
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start gap-2">
                                        <h3 class="font-bold text-stone-900 text-base truncate ${!avail ? 'line-through text-stone-400' : ''}">${escapeHTML(product.name)}</h3>
                                        <span class="font-extrabold text-amber-900 text-sm whitespace-nowrap">${formatPrice(product.price)}</span>
                                    </div>
                                    ${product.description ? `<p class="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">${escapeHTML(product.description)}</p>` : ''}
                                    ${!avail ? `<span class="inline-block mt-2 text-[9px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-md uppercase border border-red-100">Agotado</span>` : ''}
                                </div>
                            </article>
                        `;
                    }).join('')}
                </div>
            </section>
        `).join('');
}

async function loadMenu() {
    try {
        // Timeout de 8 segundos para evitar que se quede congelado
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de conexión')), 8000));
        const request = window.supabaseClient.from('products').select('*').order('name');
        
        // Compite la consulta real contra el timeout
        const { data, error } = await Promise.race([request, timeout]);
        
        if (error) throw error;

        globalProducts = data;
        renderFilterButtons();
        filterProducts();
    } catch (err) { 
        console.error("Fallo al cargar el menú:", err);
        // Desbloquea la pantalla si hay error de red o timeout
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="text-center py-16">
                    <p class="text-red-500 font-bold mb-2">Sin conexión al servidor.</p>
                    <p class="text-stone-500 text-sm mb-4">Revisa tu internet o intenta recargar.</p>
                    <button onclick="location.reload()" class="bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-bold">Reintentar</button>
                </div>`;
        }
    }
}

function init() {
    if (!menuContainer) {
        console.error("Contenedor del menú no encontrado en el DOM.");
        return;
    }
    
    if (!window.supabaseClient) {
        console.error("Supabase client no está disponible en init()");
        menuContainer.innerHTML = `<p class="text-center text-red-500 font-bold py-20">Error de inicialización de Base de Datos.</p>`;
        return;
    }

    loadMenu();

    // Limpiamos canales previos por seguridad antes de suscribirnos
    window.supabaseClient.removeAllChannels();
    
    window.supabaseClient
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { 
            // Recargamos silenciosamente ante cualquier cambio
            loadMenu(); 
        })
        .subscribe();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}