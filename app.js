// PRODUCTS DATABASE
const products = [
    {
        id: 1,
        title: "Baggy Jeans Estrellas",
        category: "bottoms",
        price: 89.99,
        image: "assets/jeans.png",
        badge: "BESTSELLER",
        description: "Jeans anchos clásicos inspirados en el skate de los 2000. Cuentan con un lavado de piedra vintage desgastado, costuras reforzadas de color crema y detalles de estrellas estampadas en los bolsillos traseros."
    },
    {
        id: 2,
        title: "Sudadera Oversize 'Grave'",
        category: "tops",
        price: 74.99,
        image: "assets/hoodie.png",
        badge: "NUEVO",
        description: "Sudadera ultra pesada (450 GSM) de algodón lavado con capucha. Presenta una silueta recortada y ancha con un gráfico frontal estilo gótico grunge impreso con tinta texturizada."
    },
    {
        id: 3,
        title: "Camiseta Gráfica 'Decay'",
        category: "tops",
        price: 34.99,
        image: "assets/tee.png",
        badge: "LIMITED",
        description: "Camiseta de corte holgado en color carbón lavado. Gráfico serigrafiado de alta densidad con estética Y2K graffiti y tintas ecológicas resistentes al desgaste. 100% algodón preencogido."
    },
    {
        id: 4,
        title: "Gorra Trucker 'Streetwear'",
        category: "accessories",
        price: 24.99,
        image: "assets/hat.png",
        badge: "POPULAR",
        description: "Gorra trucker bicolor con paneles frontales de espuma rígida crema y malla transpirable marrón. Parche frontal bordado a mano con tipografía gótica retro y cierre ajustable."
    },
    {
        id: 5,
        title: "Cadena Eslabones Metálica",
        category: "accessories",
        price: 19.99,
        image: "assets/chain.png",
        badge: "",
        description: "Cadena de eslabones cubanos de metal con revestimiento oxidado mate para un look grunge desgastado. Mosquetón resistente de liberación rápida y logo de la marca grabado en relieve."
    },
    {
        id: 6,
        title: "Pantalón Cargo Heavy-Duty",
        category: "bottoms",
        price: 84.99,
        image: "assets/lookbook_skater.png",
        badge: "ROBUSTO",
        description: "Pantalones cargo de combate hechos de lona ripstop resistente al rasgado. Múltiples bolsillos de fuelle funcionales, cordones ajustables en los tobillos y rodillas articuladas para máxima comodidad en el skate."
    }
];

// STATE MANAGEMENT
let cart = [];
let activeCategory = "all";
let selectedProduct = null;
let selectedSize = "M";

// DOM ELEMENTS
const productsGrid = document.getElementById("products-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const cartToggle = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartClose = document.getElementById("cart-close");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartCount = document.getElementById("cart-count");
const cartDrawerCount = document.getElementById("cart-drawer-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// Product Modal Elements
const productModal = document.getElementById("product-modal");
const modalClose = document.getElementById("modal-close");
const modalOverlay = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");

// Checkout Success Modal Elements
const checkoutSuccessModal = document.getElementById("checkout-success-modal");
const successCloseBtn = document.getElementById("success-close-btn");
const checkoutOverlay = document.getElementById("checkout-overlay");

// Contact Form Elements
const contactForm = document.getElementById("contact-form");
const formSuccess = document.getElementById("form-success");

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
    loadCartFromStorage();
    renderProducts();
    setupEventListeners();
    updateCartUI();
});

// EVENT LISTENERS SETUP
function setupEventListeners() {
    // Cart drawer toggles
    cartToggle.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    // Filter products
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.dataset.category;
            renderProducts();
        });
    });

    // Close product modal
    modalClose.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", closeModal);

    // Checkout simulated button
    checkoutBtn.addEventListener("click", processCheckout);

    // Close success checkout modal
    successCloseBtn.addEventListener("click", () => {
        checkoutSuccessModal.classList.remove("active");
    });
    checkoutOverlay.addEventListener("click", () => {
        checkoutSuccessModal.classList.remove("active");
    });

    // Contact Form submission
    contactForm.addEventListener("submit", handleContactSubmit);
}

// RENDER PRODUCTS IN THE GRID
function renderProducts() {
    productsGrid.innerHTML = "";
    
    const filteredProducts = activeCategory === "all" 
        ? products 
        : products.filter(p => p.category === activeCategory);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<div class="no-products">No se encontraron prendas en esta sección.</div>`;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
            <div class="product-img-wrap">
                <img src="${product.image}" alt="${product.title}" class="product-img" onerror="this.src='https://placehold.co/400x500/262626/f5f5dc?text=${encodeURIComponent(product.title)}'">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-quick" aria-label="Añadir al carrito" data-id="${product.id}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Quick view when clicking on card image/content (excluding the cart button)
        card.querySelector(".product-img-wrap").addEventListener("click", () => openQuickView(product));
        card.querySelector(".product-title").addEventListener("click", () => openQuickView(product));
        
        // Add to cart click
        card.querySelector(".add-to-cart-quick").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(product.id, "M"); // Default size M on quick add
        });

        productsGrid.appendChild(card);
    });
}

// QUICK VIEW MODAL
function openQuickView(product) {
    selectedProduct = product;
    selectedSize = "M"; // Reset selected size
    
    modalBody.innerHTML = `
        <div class="product-quickview-grid">
            <div class="quickview-img-wrap">
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://placehold.co/400x500/262626/f5f5dc?text=${encodeURIComponent(product.title)}'">
            </div>
            <div class="quickview-details">
                <span class="product-category">${product.category}</span>
                <h2 class="quickview-title">${product.title}</h2>
                <div class="quickview-price">$${product.price.toFixed(2)}</div>
                <p class="quickview-desc">${product.description}</p>
                
                ${product.category !== 'accessories' ? `
                    <span class="size-selector-label">TALLA // FIT:</span>
                    <div class="size-selector">
                        <button class="size-btn ${selectedSize === 'S' ? 'active' : ''}" data-size="S">S</button>
                        <button class="size-btn ${selectedSize === 'M' ? 'active' : ''}" data-size="M">M</button>
                        <button class="size-btn ${selectedSize === 'L' ? 'active' : ''}" data-size="L">L</button>
                        <button class="size-btn ${selectedSize === 'XL' ? 'active' : ''}" data-size="XL">XL</button>
                    </div>
                ` : ''}

                <button class="btn btn-primary" id="modal-add-btn">
                    AGREGAR A LA BOLSA <i class="fa-solid fa-cart-plus" style="margin-left: 10px;"></i>
                </button>
            </div>
        </div>
    `;

    // Size button clicks
    const sizeButtons = modalBody.querySelectorAll(".size-btn");
    sizeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            sizeButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            selectedSize = e.target.dataset.size;
        });
    });

    // Add to cart from modal button
    modalBody.querySelector("#modal-add-btn").addEventListener("click", () => {
        addToCart(product.id, selectedSize);
        closeModal();
    });

    productModal.classList.add("active");
}

function closeModal() {
    productModal.classList.remove("active");
    selectedProduct = null;
}

// CART ACTIONS
function openCart() {
    cartDrawer.classList.add("active");
}

function closeCart() {
    cartDrawer.classList.remove("active");
}

function addToCart(productId, size = "M") {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if item already exists in cart with same size
    const existingItem = cart.find(item => item.id === productId && item.size === size);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            size: size,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`"${product.title}" (${size}) agregado a la bolsa.`);
}

function updateCartUI() {
    // Update badges
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartDrawerCount.textContent = totalItems;

    // Render cart items
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; margin-top: 40px; color: var(--cream-dim);">
                <i class="fa-solid fa-ghost" style="font-size: 3rem; margin-bottom: 15px; color: var(--border-color);"></i>
                <p>Tu bolsa de compras está vacía.</p>
                <button class="btn btn-secondary" style="margin-top: 15px; font-size: 0.9rem;" onclick="closeCart()">VER PRODUCTOS</button>
            </div>
        `;
        cartSubtotal.textContent = "$0.00";
        cartTotal.textContent = "$0.00";
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = "0.5";
        checkoutBtn.style.cursor = "not-allowed";
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";
    checkoutBtn.style.cursor = "pointer";

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";
        cartItemEl.innerHTML = `
            <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/80x80/262626/f5f5dc?text=STREETWEAR'">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <div class="cart-item-meta">TALLA: ${item.size}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn dec-qty" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn inc-qty" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="Eliminar prenda">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        // Add events to quantity buttons and remove
        cartItemEl.querySelector(".dec-qty").addEventListener("click", () => changeQty(index, -1));
        cartItemEl.querySelector(".inc-qty").addEventListener("click", () => changeQty(index, 1));
        cartItemEl.querySelector(".remove-item").addEventListener("click", () => removeCartItem(index));

        cartItemsContainer.appendChild(cartItemEl);
    });

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

function changeQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCartToStorage();
    updateCartUI();
}

function removeCartItem(index) {
    const deletedItem = cart[index];
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
    showToast(`"${deletedItem.title}" removido de la bolsa.`);
}

// CHECKOUT SIMULATION
function processCheckout() {
    if (cart.length === 0) return;
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartUI();
    closeCart();
    
    // Open Success Modal
    checkoutSuccessModal.classList.add("active");
}

// TOAST NOTIFICATIONS
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add("active");
    
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

// STORAGE
function saveCartToStorage() {
    localStorage.setItem("streetwear_cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
    const storedCart = localStorage.getItem("streetwear_cart");
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (e) {
            cart = [];
        }
    }
}

// CONTACT FORM
function handleContactSubmit(e) {
    e.preventDefault();
    const alias = document.getElementById("name").value;
    
    // Hide form elements and display retro style success card
    contactForm.classList.add("hidden");
    formSuccess.classList.remove("hidden");
    
    showToast(`¡Bienvenido al clan, ${alias}!`);
}
