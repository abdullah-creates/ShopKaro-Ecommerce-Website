// Shopping Cart module
class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        
        this.init();
    }

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Cart icon click
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.showCartModal();
        });

        // Add to cart buttons (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId, e.target);
            }
        });

        // Cart item controls (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                const action = e.target.dataset.action;
                this.updateQuantity(productId, action);
            }
            
            if (e.target.classList.contains('remove-item')) {
                const productId = parseInt(e.target.dataset.productId);
                this.removeFromCart(productId);
            }
        });

        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutBtn') {
                this.checkout();
            }
        });
    }

    addToCart(productId, buttonElement) {
        const product = window.luxeStore.getProduct(productId);
        if (!product) {
            this.showMessage('Product not found.', 'error');
            return;
        }

        const existingItem = this.items.find(item => 
            item.id === productId || 
            item.name.toLowerCase() === product.name.toLowerCase()
        );
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
                this.showMessage('Quantity updated in cart!', 'success');
            } else {
                this.showMessage('Cannot add more items. Stock limit reached.', 'error');
                return;
            }
        } else {
            if (product.stock > 0) {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    maxStock: product.stock
                });
                this.showMessage('Item added to cart!', 'success');
            } else {
                this.showMessage('Sorry, this item is out of stock.', 'error');
                return;
            }
        }

        // Flying animation
        if (buttonElement) {
            this.createFlyingAnimation(buttonElement);
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.saveUserCart();
    }

    createFlyingAnimation(sourceElement) {
        if (!window.animationsManager) return;

        const rect = sourceElement.getBoundingClientRect();
        const cartIcon = document.getElementById('cartIcon');
        const cartRect = cartIcon.getBoundingClientRect();

        // Create flying element
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        flyingItem.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        
        flyingItem.style.left = rect.left + 'px';
        flyingItem.style.top = rect.top + 'px';
        
        document.body.appendChild(flyingItem);

        // Animate to cart
        const deltaX = cartRect.left - rect.left;
        const deltaY = cartRect.top - rect.top;

        flyingItem.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
                opacity: 0.7
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).addEventListener('finish', () => {
            flyingItem.remove();
            
            // Animate cart icon
            cartIcon.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                cartIcon.style.animation = '';
            }, 500);
        });
    }

    updateQuantity(productId, action) {
        const item = this.items.find(item => item.id === productId);
        if (!item) {
            this.showMessage('Product not found in cart.', 'error');
            return;
        }

        const product = window.luxeStore.getProduct(productId);
        if (!product) {
            this.showMessage('Product not found.', 'error');
            return;
        }

        if (action === 'increase') {
            if (item.quantity < item.maxStock) {
                item.quantity += 1;
                this.showMessage('Cart updated!', 'success');
            } else {
                this.showMessage('Cannot add more items. Stock limit reached.', 'error');
                return;
            }
        } else if (action === 'decrease') {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.showMessage('Cart updated!', 'success');
            } else {
                this.removeFromCart(productId);
                return;
            }
        }

        this.saveCart();
        this.updateCartDisplay();
        this.saveUserCart();
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.saveUserCart();
        this.showMessage('Item removed from cart.', 'success');
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return this.total;
    }

    updateCartDisplay() {
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart modal content
        this.renderCartItems();
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        const emptyCart = document.getElementById('emptyCart');

        if (!cartItems || !cartSummary || !emptyCart) return;

        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        cartItems.style.display = 'block';
        cartSummary.style.display = 'block';
        emptyCart.style.display = 'none';

        const formattedPrice = (price) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(price).replace('₹', 'Rs.');
        };

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formattedPrice(item.price)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.calculateTotal();
        cartSummary.innerHTML = `
            <div class="cart-total">
                <span>Total:</span>
                <span>${formattedPrice(total)}</span>
            </div>
            <button id="checkoutBtn" class="btn-primary checkout-btn">
                Proceed to Checkout
            </button>
        `;
    }

    showCartModal() {
        const modal = document.getElementById('cartModal');
        this.renderCartItems();
        modal.classList.add('show');
    }

    checkout() {
        if (this.items.length === 0) {
            this.showMessage('Your cart is empty!', 'error');
            return;
        }

        // Show checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.classList.add('show');

        // Handle form submission
        const shippingForm = document.getElementById('shippingForm');
        shippingForm.onsubmit = (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(shippingForm);
            const shippingDetails = Object.fromEntries(formData.entries());
            
            // Process order
            this.processOrder(shippingDetails);
        };

        // Close modal when clicking on close button
        const closeBtn = checkoutModal.querySelector('.close');
        closeBtn.onclick = () => {
            checkoutModal.classList.remove('show');
        };

        // Close modal when clicking outside
        window.onclick = (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('show');
            }
        };
    }

    processOrder(shippingDetails) {
        // Here you would typically send the order to a backend server
        // For now, we'll just show a success message and clear the cart
        
        const orderDetails = {
            items: this.items,
            total: this.calculateTotal(),
            shipping: shippingDetails,
            orderId: 'ORD' + Date.now(),
            orderDate: new Date().toISOString()
        };

        console.log('Order processed:', orderDetails);

        // Show success message
        this.showMessage('Order placed successfully! Order ID: ' + orderDetails.orderId, 'success');

        // Clear cart
        this.clearCart();

        // Close checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.classList.remove('show');

        // Reset form
        document.getElementById('shippingForm').reset();
    }

    loadCart() {
        const savedCart = localStorage.getItem('luxestore_cart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
            } catch (e) {
                this.items = [];
            }
        }
    }

    saveCart() {
        localStorage.setItem('luxestore_cart', JSON.stringify(this.items));
    }

    saveUserCart() {
        if (window.authManager && window.authManager.getCurrentUser()) {
            window.authManager.saveUserData();
        }
    }

    loadUserCart(cartData) {
        if (cartData && Array.isArray(cartData)) {
            this.items = cartData;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getCartItems() {
        return this.items;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    showMessage(message, type = 'success') {
        if (window.luxeStore) {
            window.luxeStore.showMessage(message, type);
        }
    }
}

// Initialize and export
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new Cart();
});

window.Cart = Cart;
