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
    const categories = ['TODOS', ...new Set(globalProducts.map(p => p.category))];
    
    categoriesFilter.innerHTML = categories.map(cat => `
        <button onclick="setCategory('${cat}')" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border
            ${activeCategory === cat 
                ? 'bg-amber-800 border-amber-800 text-white shadow-sm' 
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}">
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
        const matchesCategory = activeCategory === 'TODOS' || product.category === activeCategory;
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
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
    });

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
                        return `
                            <article class="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm flex gap-4 items-center relative overflow-hidden transition-all ${!avail ? 'opacity-50 select-none' : ''}">
                                ${product.image_url ? `<img src="${escapeHTML(product.image_url)}" class="w-20 h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0 ${!avail ? 'grayscale' : ''}">` : ''}
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start gap-2">
                                        <h3 class="font-bold text-stone-900 text-base truncate ${!avail ? 'line-through text-stone-400' : ''}">${escapeHTML(product.name)}</h3>
                                        <span class="font-extrabold text-stone-900 text-sm whitespace-nowrap">${formatPrice(product.price)}</span>
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
        const { data, error } = await supabaseClient.from('products').select('*').order('name');
        if (error) return;
        globalProducts = data;
        renderFilterButtons();
        filterProducts();
    } catch (err) { console.error(err); }
}

function init() {
    // Si por alguna razón el HTML aún no carga los inputs, esperamos un milisegundo
    if (!menuContainer) {
        console.error("Contenedor del menú no encontrado en el DOM.");
        return;
    }
    
    loadMenu();

    if (supabaseClient) {
        supabaseClient
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { 
                loadMenu(); 
            })
            .subscribe();
    } else {
        console.error("Supabase client no está disponible en init()");
    }
}

// Forzar la ejecución segura cuando el DOM esté completamente listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
