/* ============================================
   THE BREAKERY - STOCK MODULE LOGIC
   Mini-ERP Stock Management Logic
   ============================================ */

// ============================================
// MOCK DATA: STOCK INVENTORY
// ============================================
let INVENTORY = [
    // COFFEE BEANS
    { id: 101, name: 'Grains Arabica Premium', sku: 'CAF-ARA-01', category: 'coffee', stock: 15.5, unit: 'kg', min: 10, lastUpdated: '2025-06-15' },
    { id: 102, name: 'Grains Robusta Blend', sku: 'CAF-ROB-01', category: 'coffee', stock: 8.2, unit: 'kg', min: 5, lastUpdated: '2025-06-14' },
    { id: 103, name: 'Chocolat en Poudre', sku: 'ING-CHO-01', category: 'ingredients', stock: 4.0, unit: 'kg', min: 2, lastUpdated: '2025-06-10' },

    // MILK & DAIRY
    { id: 201, name: 'Lait Entier Fresh', sku: 'LAI-ENT-01', category: 'ingredients', stock: 12, unit: 'L', min: 20, lastUpdated: '2025-06-16' },  // LOW
    { id: 202, name: 'Lait Avoine Oatside', sku: 'LAI-AVO-01', category: 'ingredients', stock: 24, unit: 'L', min: 12, lastUpdated: '2025-06-12' },
    { id: 203, name: 'Crème Liquide 35%', sku: 'ING-CRE-01', category: 'ingredients', stock: 0, unit: 'L', min: 5, lastUpdated: '2025-06-01' },   // OUT

    // FLOUR & BAKERY
    { id: 301, name: 'Farine T65 Tradition', sku: 'FAR-T65-01', category: 'ingredients', stock: 150, unit: 'kg', min: 50, lastUpdated: '2025-06-15' },
    { id: 302, name: 'Farine T45 Pâtisserie', sku: 'FAR-T45-01', category: 'ingredients', stock: 45, unit: 'kg', min: 20, lastUpdated: '2025-06-15' },
    { id: 303, name: 'Beurre AOP Charentes', sku: 'ING-BEU-01', category: 'ingredients', stock: 30, unit: 'kg', min: 10, lastUpdated: '2025-06-14' },
    { id: 304, name: 'Sucre Semoule', sku: 'ING-SUC-01', category: 'ingredients', stock: 25, unit: 'kg', min: 15, lastUpdated: '2025-05-20' },
    { id: 305, name: 'Levure Fraîche', sku: 'ING-LEV-01', category: 'ingredients', stock: 1.5, unit: 'kg', min: 2, lastUpdated: '2025-06-16' }, // LOW

    // PACKAGING
    { id: 401, name: 'Gobelet Café 8oz', sku: 'UMB-GBT-08', category: 'packaging', stock: 450, unit: 'pcs', min: 200, lastUpdated: '2025-06-01' },
    { id: 402, name: 'Gobelet Café 12oz', sku: 'UMB-GBT-12', category: 'packaging', stock: 320, unit: 'pcs', min: 200, lastUpdated: '2025-06-01' },
    { id: 403, name: 'Boîte Pâtisserie x1', sku: 'UMB-BOX-01', category: 'packaging', stock: 50, unit: 'pcs', min: 100, lastUpdated: '2025-06-05' }, // LOW
    { id: 404, name: 'Sac Papier Kraft M', sku: 'UMB-SAC-02', category: 'packaging', stock: 800, unit: 'pcs', min: 300, lastUpdated: '2025-05-30' },

    // DRINKS READY TO SELL
    { id: 501, name: 'Coca Cola 33cl', sku: 'BOI-SOD-01', category: 'drinks', stock: 24, unit: 'can', min: 12, lastUpdated: '2025-06-10' },
    { id: 502, name: 'Eau Minérale 50cl', sku: 'BOI-EAU-01', category: 'drinks', stock: 48, unit: 'btl', min: 24, lastUpdated: '2025-06-10' },
    { id: 503, name: 'Jus Orange Pressé', sku: 'BOI-JUS-01', category: 'drinks', stock: 5, unit: 'L', min: 5, lastUpdated: '2025-06-16' },
];

const CATEGORY_NAMES = {
    coffee: 'Café',
    ingredients: 'Ingrédients',
    packaging: 'Emballage',
    drinks: 'Boissons'
};

// ============================================
// STATE
// ============================================
let state = {
    products: [...INVENTORY],
    filter: 'all',
    search: '',
    modalProduct: null
};

// ============================================
// UTILS
// ============================================
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getStatus(stock, min) {
    if (stock === 0) return 'out';
    if (stock <= min) return 'low';
    return 'ok';
}

function getStatusLabel(status) {
    switch (status) {
        case 'ok': return '<span class="status-dot ok"></span>En Stock';
        case 'low': return '<span class="status-dot low"></span>Stock Bas';
        case 'out': return '<span class="status-dot out"></span>Rupture';
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// CORE FUNCTIONS
// ============================================

function updateStats() {
    const total = state.products.length;
    const low = state.products.filter(p => p.stock <= p.min && p.stock > 0).length;
    const out = state.products.filter(p => p.stock === 0).length;

    // Mock value calculation
    const totalValue = state.products.reduce((acc, p) => acc + (p.stock * 50000), 0); // Mock avg price

    document.getElementById('statsTotal').textContent = total;
    document.getElementById('statsLow').textContent = low;
    document.getElementById('statsOut').textContent = out;
    document.getElementById('statsValue').textContent = 'Rp ' + (totalValue / 1000000).toFixed(1) + 'M';
}

function renderTable() {
    const tbody = document.getElementById('stockTableBody');
    const tbodyHtml = state.products
        // Filter by Category
        .filter(p => state.filter === 'all' || p.category === state.filter)
        // Filter by Search
        .filter(p =>
            p.name.toLowerCase().includes(state.search) ||
            p.sku.toLowerCase().includes(state.search)
        )
        .map(p => {
            const status = getStatus(p.stock, p.min);

            return `
        <tr>
          <td>
            <div class="product-cell">
              <div class="product-icon">📦</div>
              <div class="product-info">
                <span class="product-name">${p.name}</span>
                <span class="product-sku">${p.sku}</span>
              </div>
            </div>
          </td>
          <td><div class="badge badge-category">${CATEGORY_NAMES[p.category]}</div></td>
          <td style="font-weight: 700;">${p.stock}</td>
          <td style="color: var(--color-gris-chaud);">${p.unit}</td>
          <td>${getStatusLabel(status)}</td>
          <td style="font-family: var(--font-mono);">${formatDate(p.lastUpdated)}</td>
          <td>
            <button class="btn-icon btn-icon-sm" title="Ajuster" onclick="openAdjustModal(${p.id})">
              <i data-lucide="sliders" width="16" height="16"></i>
            </button>
          </td>
        </tr>
      `;
        }).join('');

    tbody.innerHTML = tbodyHtml;
    lucide.createIcons();
}

// ============================================
// ADJUSTMENT MODAL
// ============================================

window.openAdjustModal = function (productId = null) {
    const modal = document.getElementById('adjustModal');
    const productSelect = document.getElementById('adjustProduct');

    // Populate options
    productSelect.innerHTML = '<option value="">Sélectionner un produit...</option>' +
        state.products.map(p =>
            `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${p.name} (${p.stock} ${p.unit})</option>`
        ).join('');

    // Reset form
    document.getElementById('adjustQty').value = '';
    document.querySelector('input[name="adjustType"][value="in"]').checked = true;
    document.getElementById('adjustReason').value = 'purchase';

    modal.classList.add('is-active');
    document.querySelector('.modal').classList.add('is-active');
}

function closeAdjustModal() {
    const modal = document.getElementById('adjustModal');
    modal.classList.remove('is-active');
    document.querySelector('.modal').classList.remove('is-active');
}

function saveAdjustment() {
    const productId = parseInt(document.getElementById('adjustProduct').value);
    const type = document.querySelector('input[name="adjustType"]:checked').value;
    const qty = parseFloat(document.getElementById('adjustQty').value);
    const reason = document.getElementById('adjustReason').value;

    if (!productId || isNaN(qty) || qty <= 0) {
        showToast('Veuillez remplir correctement le formulaire', 'error');
        return;
    }

    // Update inventory
    const productIndex = state.products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = state.products[productIndex];
    let newStock = product.stock;

    if (type === 'in') newStock += qty;
    else if (type === 'out') newStock -= qty;
    else if (type === 'set') newStock = qty;

    // Prevent negative stock
    if (newStock < 0) {
        showToast('Le stock ne peut pas être négatif', 'error');
        return;
    }

    // Persist change
    state.products[productIndex].stock = newStock;
    state.products[productIndex].lastUpdated = new Date().toISOString();

    // Refresh UI
    renderTable();
    updateStats();
    closeAdjustModal();

    showToast(`Stock mis à jour: ${product.name} (${newStock} ${product.unit})`, 'success');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateStats();
    renderTable();

    // Event Listeners
    document.getElementById('stockSearch').addEventListener('input', (e) => {
        state.search = e.target.value.toLowerCase();
        renderTable();
    });

    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        state.filter = e.target.value;
        renderTable();
    });

    // Modal Actions
    document.getElementById('adjustStockBtn').addEventListener('click', () => openAdjustModal());
    document.getElementById('closeAdjustModal').addEventListener('click', closeAdjustModal);
    document.getElementById('cancelAdjustBtn').addEventListener('click', closeAdjustModal);
    document.getElementById('saveAdjustBtn').addEventListener('click', saveAdjustment);

    // Close modal on outside click
    document.getElementById('adjustModal').addEventListener('click', (e) => {
        if (e.target.id === 'adjustModal') closeAdjustModal();
    });
});
