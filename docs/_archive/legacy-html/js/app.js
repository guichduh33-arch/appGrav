/* ============================================
   THE BREAKERY - POS APPLICATION
   Main JavaScript Application Logic
   ============================================ */

// ============================================
// DATA: Products Catalog
// ============================================
const PRODUCTS = [
    // Coffee
    { id: 1, name: 'Cappuccino', price: 35000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 2, name: 'Latte', price: 35000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 3, name: 'Americano', price: 30000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 4, name: 'Espresso', price: 25000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 5, name: 'Flat White', price: 35000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 6, name: 'Mocha', price: 45000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 7, name: 'Double Espresso', price: 35000, category: 'coffee', icon: '☕', hasModifiers: true },
    { id: 8, name: 'Macchiato', price: 30000, category: 'coffee', icon: '☕', hasModifiers: true },

    // Drinks
    { id: 9, name: 'Matcha Latte', price: 50000, category: 'drinks', icon: '🍵', hasModifiers: true },
    { id: 10, name: 'Chai Latte', price: 40000, category: 'drinks', icon: '🧋', hasModifiers: true },
    { id: 11, name: 'Hot Chocolate', price: 40000, category: 'drinks', icon: '🍫', hasModifiers: true },
    { id: 12, name: 'Fresh Orange Juice', price: 35000, category: 'drinks', icon: '🍊', hasModifiers: false },
    { id: 13, name: 'Iced Tea', price: 25000, category: 'drinks', icon: '🧊', hasModifiers: false },
    { id: 14, name: 'Limonade Maison', price: 30000, category: 'drinks', icon: '🍋', hasModifiers: false },

    // Viennoiseries
    { id: 15, name: 'Croissant', price: 25000, category: 'viennoiseries', icon: '🥐', hasModifiers: false },
    { id: 16, name: 'Pain au Chocolat', price: 28000, category: 'viennoiseries', icon: '🥐', hasModifiers: false },
    { id: 17, name: 'Croissant Amande', price: 35000, category: 'viennoiseries', icon: '🥐', hasModifiers: false },
    { id: 18, name: 'Chausson aux Pommes', price: 30000, category: 'viennoiseries', icon: '🥧', hasModifiers: false },
    { id: 19, name: 'Pain aux Raisins', price: 28000, category: 'viennoiseries', icon: '🥐', hasModifiers: false },
    { id: 20, name: 'Brioche Feuilletée', price: 32000, category: 'viennoiseries', icon: '🥐', hasModifiers: false },

    // Pastries
    { id: 21, name: 'Éclair Chocolat', price: 35000, category: 'pastries', icon: '🍫', hasModifiers: false },
    { id: 22, name: 'Paris-Brest', price: 45000, category: 'pastries', icon: '🍰', hasModifiers: false },
    { id: 23, name: 'Tarte au Citron', price: 40000, category: 'pastries', icon: '🍋', hasModifiers: false },
    { id: 24, name: 'Opéra', price: 55000, category: 'pastries', icon: '🍰', hasModifiers: false },
    { id: 25, name: 'Fraisier', price: 50000, category: 'pastries', icon: '🍓', hasModifiers: false },
    { id: 26, name: 'Mille-Feuille', price: 45000, category: 'pastries', icon: '🍰', hasModifiers: false },

    // Bread
    { id: 27, name: 'Baguette Tradition', price: 20000, category: 'bread', icon: '🥖', hasModifiers: false },
    { id: 28, name: 'Pain de Campagne', price: 35000, category: 'bread', icon: '🍞', hasModifiers: false },
    { id: 29, name: 'Pain Complet', price: 30000, category: 'bread', icon: '🍞', hasModifiers: false },
    { id: 30, name: 'Focaccia Romarin', price: 40000, category: 'bread', icon: '🫓', hasModifiers: false },

    // Bagels
    { id: 31, name: 'Bagel Saumon', price: 65000, category: 'bagels', icon: '🥯', hasModifiers: false },
    { id: 32, name: 'Bagel Avocat', price: 55000, category: 'bagels', icon: '🥯', hasModifiers: false },
    { id: 33, name: 'Bagel Cream Cheese', price: 45000, category: 'bagels', icon: '🥯', hasModifiers: false },
    { id: 34, name: 'Bagel Bacon Egg', price: 60000, category: 'bagels', icon: '🥯', hasModifiers: false },

    // Sandwiches
    { id: 35, name: 'Jambon Beurre', price: 45000, category: 'sandwiches', icon: '🥪', hasModifiers: false },
    { id: 36, name: 'Club Sandwich', price: 65000, category: 'sandwiches', icon: '🥪', hasModifiers: false },
    { id: 37, name: 'Croque Monsieur', price: 55000, category: 'sandwiches', icon: '🥪', hasModifiers: false },
    { id: 38, name: 'Veggie Wrap', price: 50000, category: 'sandwiches', icon: '🌯', hasModifiers: false },
];

// Category names for display
const CATEGORY_NAMES = {
    'all': 'Tous les produits',
    'coffee': 'Café',
    'drinks': 'Boissons',
    'viennoiseries': 'Viennoiseries',
    'pastries': 'Pâtisseries',
    'bread': 'Pains',
    'bagels': 'Bagels',
    'sandwiches': 'Sandwiches'
};

// Modifier prices
const MODIFIER_PRICES = {
    temperature: { hot: 0, iced: 5000 },
    milk: { normal: 0, oat: 8000, soy: 6000, almond: 8000, none: 0 },
    options: { 'extra-shot': 10000, 'no-sugar': 0, 'whipped-cream': 5000 }
};

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
    cart: [],
    currentCategory: 'all',
    currentProduct: null,
    orderNumber: 42,
    orderType: 'dine-in',
    discount: 0,
    holdOrders: [],
    amountReceived: 0
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function generateOrderNumber() {
    state.orderNumber++;
    return '#' + state.orderNumber.toString().padStart(4, '0');
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// PRODUCTS GRID
// ============================================
function renderProducts(category = 'all', searchQuery = '') {
    const grid = document.getElementById('productsGrid');
    const title = document.getElementById('categoryTitle');

    // Filter products
    let filteredProducts = PRODUCTS;

    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(query)
        );
    }

    // Update title
    title.textContent = searchQuery ? `Résultats pour "${searchQuery}"` : CATEGORY_NAMES[category];

    // Render products
    grid.innerHTML = filteredProducts.map(product => `
    <div class="pos-product-card" data-product-id="${product.id}">
      <div class="pos-product-card__image">${product.icon}</div>
      <div class="pos-product-card__name">${product.name}</div>
      <div class="pos-product-card__price">${formatPrice(product.price)}</div>
    </div>
  `).join('');

    // Add click handlers
    grid.querySelectorAll('.pos-product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = parseInt(card.dataset.productId);
            const product = PRODUCTS.find(p => p.id === productId);
            handleProductClick(product);
        });
    });
}

function handleProductClick(product) {
    if (product.hasModifiers) {
        openModifierModal(product);
    } else {
        addToCart({
            ...product,
            quantity: 1,
            modifiers: {},
            totalPrice: product.price
        });

        // Visual feedback
        showToast(`${product.name} ajouté au panier`);
    }
}

// ============================================
// CATEGORIES
// ============================================
function initCategories() {
    const sidebar = document.getElementById('categoriesSidebar');

    sidebar.querySelectorAll('.pos-categories__item').forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            sidebar.querySelectorAll('.pos-categories__item').forEach(i => i.classList.remove('is-active'));
            item.classList.add('is-active');

            // Update products
            state.currentCategory = item.dataset.category;
            document.getElementById('productSearch').value = '';
            renderProducts(state.currentCategory);
        });
    });
}

// ============================================
// SEARCH
// ============================================
function initSearch() {
    const searchInput = document.getElementById('productSearch');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            renderProducts(state.currentCategory, e.target.value);
        }, 300);
    });
}

// ============================================
// CART MANAGEMENT
// ============================================
function addToCart(item) {
    // Check if same item with same modifiers exists
    const existingIndex = state.cart.findIndex(cartItem =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.modifiers) === JSON.stringify(item.modifiers)
    );

    if (existingIndex >= 0) {
        state.cart[existingIndex].quantity += item.quantity;
        state.cart[existingIndex].totalPrice =
            state.cart[existingIndex].quantity *
            (item.totalPrice / item.quantity);
    } else {
        state.cart.push({ ...item, cartId: Date.now() });
    }

    renderCart();
}

function removeFromCart(cartId) {
    state.cart = state.cart.filter(item => item.cartId !== cartId);
    renderCart();
    showToast('Article supprimé', 'info');
}

function clearCart() {
    if (state.cart.length === 0) return;

    if (confirm('Voulez-vous vraiment vider le panier ?')) {
        state.cart = [];
        state.discount = 0;
        renderCart();
        showToast('Panier vidé', 'info');
    }
}

function getCartTotal() {
    return state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
}

function renderCart() {
    const itemsContainer = document.getElementById('cartItems');
    const totalsContainer = document.getElementById('cartTotals');
    const emptyState = document.getElementById('cartEmpty');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutAmount = document.getElementById('checkoutAmount');

    if (state.cart.length === 0) {
        // Show empty state
        emptyState.style.display = 'flex';
        totalsContainer.style.display = 'none';
        checkoutBtn.disabled = true;
        checkoutAmount.textContent = 'Rp 0';
        itemsContainer.innerHTML = '';
        itemsContainer.appendChild(emptyState);
        return;
    }

    // Hide empty state
    emptyState.style.display = 'none';
    totalsContainer.style.display = 'block';
    checkoutBtn.disabled = false;

    // Render items
    itemsContainer.innerHTML = state.cart.map(item => {
        // Build modifiers text
        let modsText = [];
        if (item.modifiers.temperature === 'iced') modsText.push('Glacé');
        if (item.modifiers.milk && item.modifiers.milk !== 'normal') {
            const milkNames = { oat: 'Lait Avoine', soy: 'Lait Soja', almond: 'Lait Amande', none: 'Sans Lait' };
            modsText.push(milkNames[item.modifiers.milk]);
        }
        if (item.modifiers.options) {
            item.modifiers.options.forEach(opt => {
                const optNames = { 'extra-shot': 'Extra Shot', 'no-sugar': 'Sans Sucre', 'whipped-cream': 'Chantilly' };
                modsText.push(optNames[opt]);
            });
        }

        return `
      <div class="cart-item is-new">
        <div class="cart-item__info">
          <div class="cart-item__name">
            ${item.name}
            <span class="cart-item__qty">×${item.quantity}</span>
          </div>
          ${modsText.length > 0 ? `<div class="cart-item__mods">${modsText.join(', ')}</div>` : ''}
        </div>
        <div class="cart-item__price">${formatPrice(item.totalPrice)}</div>
        <button class="cart-item__remove" data-cart-id="${item.cartId}">
          <i data-lucide="x" width="16" height="16"></i>
        </button>
      </div>
    `;
    }).join('');

    // Re-init Lucide icons for new elements
    lucide.createIcons();

    // Add remove handlers
    itemsContainer.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.cartId));
        });
    });

    // Update totals
    const subtotal = getCartTotal();
    const grandTotal = subtotal - state.discount;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('discount').textContent = '-' + formatPrice(state.discount);
    document.getElementById('grandTotal').textContent = formatPrice(grandTotal);
    checkoutAmount.textContent = formatPrice(grandTotal);
}

// ============================================
// MODIFIER MODAL
// ============================================
function openModifierModal(product) {
    state.currentProduct = product;

    // Reset modal
    document.getElementById('modifierProductIcon').textContent = product.icon;
    document.getElementById('modifierProductName').textContent = product.name;
    document.getElementById('qtyValue').textContent = '1';
    document.getElementById('modifierNotes').value = '';

    // Reset selections
    document.querySelector('input[name="temperature"][value="hot"]').checked = true;
    document.querySelector('input[name="milk"][value="normal"]').checked = true;
    document.querySelectorAll('input[name="options"]').forEach(cb => cb.checked = false);

    // Update total
    updateModifierTotal();

    // Show modal
    document.getElementById('modifierModal').classList.add('is-active');
    document.getElementById('modifierModalContent').classList.add('is-active');
}

function closeModifierModal() {
    document.getElementById('modifierModal').classList.remove('is-active');
    document.getElementById('modifierModalContent').classList.remove('is-active');
    state.currentProduct = null;
}

function updateModifierTotal() {
    if (!state.currentProduct) return;

    let total = state.currentProduct.price;

    // Temperature
    const temp = document.querySelector('input[name="temperature"]:checked')?.value;
    if (temp) total += MODIFIER_PRICES.temperature[temp];

    // Milk
    const milk = document.querySelector('input[name="milk"]:checked')?.value;
    if (milk) total += MODIFIER_PRICES.milk[milk];

    // Options
    document.querySelectorAll('input[name="options"]:checked').forEach(cb => {
        total += MODIFIER_PRICES.options[cb.value] || 0;
    });

    // Quantity
    const qty = parseInt(document.getElementById('qtyValue').textContent);
    total *= qty;

    document.getElementById('modifierTotal').textContent = formatPrice(total);

    return total;
}

function addModifiedProductToCart() {
    const product = state.currentProduct;
    if (!product) return;

    const quantity = parseInt(document.getElementById('qtyValue').textContent);
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value;
    const milk = document.querySelector('input[name="milk"]:checked')?.value;
    const options = Array.from(document.querySelectorAll('input[name="options"]:checked')).map(cb => cb.value);
    const notes = document.getElementById('modifierNotes').value;

    const unitPrice = updateModifierTotal() / quantity;
    const totalPrice = unitPrice * quantity;

    addToCart({
        ...product,
        quantity,
        modifiers: { temperature, milk, options, notes },
        totalPrice
    });

    closeModifierModal();
    showToast(`${quantity}× ${product.name} ajouté au panier`);
}

function initModifierModal() {
    // Close button
    document.getElementById('closeModifierModal').addEventListener('click', closeModifierModal);

    // Click backdrop to close
    document.getElementById('modifierModal').addEventListener('click', (e) => {
        if (e.target.id === 'modifierModal') closeModifierModal();
    });

    // Quantity buttons
    document.getElementById('qtyMinus').addEventListener('click', () => {
        const qtyEl = document.getElementById('qtyValue');
        const current = parseInt(qtyEl.textContent);
        if (current > 1) {
            qtyEl.textContent = current - 1;
            updateModifierTotal();
        }
    });

    document.getElementById('qtyPlus').addEventListener('click', () => {
        const qtyEl = document.getElementById('qtyValue');
        const current = parseInt(qtyEl.textContent);
        if (current < 99) {
            qtyEl.textContent = current + 1;
            updateModifierTotal();
        }
    });

    // Listen for modifier changes
    document.querySelectorAll('input[name="temperature"], input[name="milk"], input[name="options"]').forEach(input => {
        input.addEventListener('change', updateModifierTotal);
    });

    // Add to cart button
    document.getElementById('addToCartBtn').addEventListener('click', addModifiedProductToCart);
}

// ============================================
// PAYMENT MODAL
// ============================================
function openPaymentModal() {
    const total = getCartTotal() - state.discount;

    document.getElementById('paymentTotalAmount').textContent = formatPrice(total);
    document.getElementById('paymentOrderNumber').textContent = document.getElementById('orderNumber').textContent;

    // Reset
    document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
    document.getElementById('amountInput').value = 'Rp 0';
    state.amountReceived = 0;
    document.getElementById('changeDisplay').style.display = 'none';
    document.getElementById('cashSection').style.display = 'block';
    document.getElementById('numpadSection').style.display = 'block';

    // Show modal
    document.getElementById('paymentModal').classList.add('is-active');
    document.getElementById('paymentModalContent').classList.add('is-active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('is-active');
    document.getElementById('paymentModalContent').classList.remove('is-active');
}

function updatePaymentAmount(amount) {
    state.amountReceived = amount;
    document.getElementById('amountInput').value = formatPrice(amount);

    const total = getCartTotal() - state.discount;
    const change = amount - total;

    if (change >= 0 && amount > 0) {
        document.getElementById('changeDisplay').style.display = 'flex';
        document.getElementById('changeAmount').textContent = formatPrice(change);
    } else {
        document.getElementById('changeDisplay').style.display = 'none';
    }
}

function processPayment() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const total = getCartTotal() - state.discount;

    // For cash, validate amount
    if (paymentMethod === 'cash' && state.amountReceived < total && state.amountReceived !== 0) {
        showToast('Montant insuffisant', 'error');
        return;
    }

    // Process payment
    closePaymentModal();

    // Show success modal
    const change = state.amountReceived - total;
    document.getElementById('successOrderNumber').textContent = document.getElementById('orderNumber').textContent;

    if (paymentMethod === 'cash' && change > 0) {
        document.getElementById('successChange').style.display = 'flex';
        document.getElementById('successChangeAmount').textContent = formatPrice(change);
    } else {
        document.getElementById('successChange').style.display = 'none';
    }

    document.getElementById('successModal').classList.add('is-active');
    document.getElementById('successModalContent').classList.add('is-active');
}

function startNewOrder() {
    // Close success modal
    document.getElementById('successModal').classList.remove('is-active');
    document.getElementById('successModalContent').classList.remove('is-active');

    // Reset cart
    state.cart = [];
    state.discount = 0;
    state.amountReceived = 0;

    // New order number
    document.getElementById('orderNumber').textContent = generateOrderNumber();

    renderCart();
    showToast('Nouvelle commande créée', 'info');
}

function initPaymentModal() {
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', openPaymentModal);

    // Close buttons
    document.getElementById('closePaymentModal').addEventListener('click', closePaymentModal);
    document.getElementById('cancelPaymentBtn').addEventListener('click', closePaymentModal);

    // Click backdrop to close
    document.getElementById('paymentModal').addEventListener('click', (e) => {
        if (e.target.id === 'paymentModal') closePaymentModal();
    });

    // Payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener('change', () => {
            const isCash = input.value === 'cash';
            document.getElementById('cashSection').style.display = isCash ? 'block' : 'none';
            document.getElementById('numpadSection').style.display = isCash ? 'block' : 'none';
            state.amountReceived = 0;
            document.getElementById('amountInput').value = 'Rp 0';
            document.getElementById('changeDisplay').style.display = 'none';
        });
    });

    // Quick amount buttons
    document.getElementById('quickAmounts').addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-amount-btn')) {
            const amount = e.target.dataset.amount;
            if (amount === 'exact') {
                updatePaymentAmount(getCartTotal() - state.discount);
            } else {
                updatePaymentAmount(parseInt(amount));
            }
        }
    });

    // Numpad
    document.querySelectorAll('.numpad__key').forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.dataset.key;
            let currentAmount = state.amountReceived.toString();

            if (keyValue === 'clear') {
                currentAmount = '0';
            } else if (keyValue === 'backspace') {
                currentAmount = currentAmount.slice(0, -1) || '0';
            } else {
                if (currentAmount === '0') {
                    currentAmount = keyValue;
                } else {
                    currentAmount += keyValue;
                }
            }

            updatePaymentAmount(parseInt(currentAmount));
        });
    });

    // Confirm payment
    document.getElementById('confirmPaymentBtn').addEventListener('click', processPayment);

    // Success modal buttons
    document.getElementById('newOrderBtn').addEventListener('click', startNewOrder);
    document.getElementById('printReceiptBtn').addEventListener('click', () => {
        showToast('Ticket en cours d\'impression...', 'info');
    });

    // Click backdrop to close success
    document.getElementById('successModal').addEventListener('click', (e) => {
        if (e.target.id === 'successModal') startNewOrder();
    });
}

// ============================================
// ORDER TYPE SELECTOR
// ============================================
function initOrderTypeSelector() {
    const selector = document.querySelector('.order-type-selector');

    selector.querySelectorAll('.order-type-selector__option').forEach(option => {
        option.addEventListener('click', () => {
            selector.querySelectorAll('.order-type-selector__option').forEach(o => o.classList.remove('is-active'));
            option.classList.add('is-active');

            state.orderType = option.dataset.type;

            const typeNames = {
                'dine-in': 'Sur place',
                'takeaway': 'À emporter',
                'delivery': 'Livraison'
            };
            document.getElementById('orderType').textContent = typeNames[state.orderType];
        });
    });
}

// ============================================
// OTHER BUTTONS
// ============================================
function initOtherButtons() {
    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Customer button
    document.getElementById('customerBtn').addEventListener('click', () => {
        showToast('Recherche client - Fonctionnalité à venir', 'info');
    });

    // Discount button
    document.getElementById('discountBtn').addEventListener('click', () => {
        showToast('Application remise - Fonctionnalité à venir', 'info');
    });

    // Footer buttons
    document.getElementById('holdOrderBtn').addEventListener('click', () => {
        if (state.cart.length === 0) {
            showToast('Le panier est vide', 'warning');
            return;
        }
        state.holdOrders.push({
            items: [...state.cart],
            orderNumber: document.getElementById('orderNumber').textContent,
            orderType: state.orderType
        });
        state.cart = [];
        document.getElementById('orderNumber').textContent = generateOrderNumber();
        document.getElementById('holdCount').textContent = state.holdOrders.length;
        document.getElementById('holdCount').style.display = 'inline-flex';
        renderCart();
        showToast('Commande mise en attente', 'info');
    });

    document.getElementById('ordersBtn').addEventListener('click', () => {
        showToast('Historique commandes - Fonctionnalité à venir', 'info');
    });

    document.getElementById('printBtn').addEventListener('click', () => {
        showToast('Impression ticket - Fonctionnalité à venir', 'info');
    });

    document.getElementById('sessionBtn').addEventListener('click', () => {
        showToast('Gestion session - Fonctionnalité à venir', 'info');
    });

    document.getElementById('kdsBtn').addEventListener('click', () => {
        window.location.href = 'kds.html';
    });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModifierModal();
            closePaymentModal();
        }

        // F2 for quick payment
        if (e.key === 'F2' && state.cart.length > 0) {
            e.preventDefault();
            openPaymentModal();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);

    // Initialize components
    initCategories();
    initSearch();
    initModifierModal();
    initPaymentModal();
    initOrderTypeSelector();
    initOtherButtons();
    initKeyboardShortcuts();

    // Render initial products
    renderProducts();
    renderCart();

    console.log('🥐 The Breakery POS initialized');
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
