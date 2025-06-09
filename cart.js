// Shopping Cart module
class Cart {
    constructor() {
        console.log('Cart constructor called');
        if (Cart.instance) {
            console.log('Returning existing Cart instance');
            return Cart.instance;
        }
        console.log('Creating new Cart instance');
        Cart.instance = this;
        
        this.items = [];
        this.total = 0;
        this.initialized = false;
        this.eventListenersSet = false;
        this.init();
    }

    init() {
        console.log('Cart init called, initialized:', this.initialized);
        if (this.initialized) return;
        this.loadCart();
        this.setupEventListeners();
        this.updateCartDisplay();
        this.initialized = true;
    }

    setupEventListeners() {
        console.log('Setting up event listeners, already set:', this.eventListenersSet);
        if (this.eventListenersSet) return;

        // Remove any existing listeners to be safe
        document.removeEventListener('click', this.handleCartClick);
        document.removeEventListener('click', this.handleCartControls);
        document.removeEventListener('click', this.handleCheckout);

        // Cart icon click
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.removeEventListener('click', this.showCartModalBound);
            this.showCartModalBound = () => this.showCartModal();
            cartIcon.addEventListener('click', this.showCartModalBound);
        }

        // Add to cart buttons (using a single delegated event listener)
        this.handleCartClick = (e) => {
            const addToCartBtn = e.target.closest('.btn-add-cart');
            if (!addToCartBtn) return;
            
            console.log('Add to cart clicked for product:', addToCartBtn.dataset.productId);
            
            e.preventDefault();
            e.stopPropagation();
            
            const productId = parseInt(addToCartBtn.dataset.productId);
            if (!isNaN(productId)) {
                // Check if we've already processed this click
                if (addToCartBtn.dataset.processing === 'true') {
                    console.log('Already processing click, ignoring');
                    return;
                }
                
                // Set processing flag
                addToCartBtn.dataset.processing = 'true';
                
                // Add to cart
                this.addToCart(productId, addToCartBtn);
                
                // Remove processing flag after a short delay
                setTimeout(() => {
                    delete addToCartBtn.dataset.processing;
                }, 500);
            }
        };

        // Cart item controls
        this.handleCartControls = (e) => {
            const target = e.target;
            
            if (target.classList.contains('quantity-btn')) {
                const productId = parseInt(target.dataset.productId);
                const action = target.dataset.action;
                if (!isNaN(productId)) {
                    this.updateQuantity(productId, action);
                }
                return;
            }
            
            const removeButton = target.closest('.remove-item');
            if (removeButton) {
                const productId = parseInt(removeButton.dataset.productId);
                if (!isNaN(productId)) {
                    this.removeFromCart(productId);
                }
            }
        };

        // Checkout button
        this.handleCheckout = (e) => {
            if (e.target.id === 'checkoutBtn') {
                this.checkout();
            }
        };

        // Add event listeners
        document.addEventListener('click', this.handleCartClick);
        document.addEventListener('click', this.handleCartControls);
        document.addEventListener('click', this.handleCheckout);

        // Close modal buttons
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) modal.classList.remove('show');
            });
        });

        this.eventListenersSet = true;
        console.log('Event listeners setup complete');
    }

    addToCart(productId, buttonElement) {
        console.log('Adding to cart:', productId);
        const product = window.luxeStore.getProduct(productId);
        if (!product) {
            this.showMessage('Product not found.', 'error');
            return;
        }

        const existingItem = this.items.find(item => item.id === productId);
        
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
        const emptyCart = document.getElementById('emptyCart');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems || !emptyCart) return;

        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            emptyCart.style.display = 'block';
            if (cartTotal) cartTotal.textContent = 'Rs.0.00';
            return;
        }

        cartItems.style.display = 'block';
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
        if (cartTotal) cartTotal.textContent = formattedPrice(total);
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
        const checkoutForm = document.getElementById('checkoutForm');
        
        if (!checkoutModal || !checkoutForm) {
            console.error('Checkout modal or form not found');
            return;
        }

        // Remove any existing event listeners
        const oldForm = checkoutForm.cloneNode(true);
        checkoutForm.parentNode.replaceChild(oldForm, checkoutForm);

        // Add event listener for form submission
        oldForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(oldForm);
            const shippingDetails = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                pincode: formData.get('pincode')
            };
            
            // Process order
            this.processOrder(shippingDetails);
            
            // Close cart modal if it's open
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                cartModal.classList.remove('show');
            }
            
            // Close checkout modal
            checkoutModal.classList.remove('show');
        });

        // Show the modal
        checkoutModal.classList.add('show');

        // Close modal when clicking on close button
        const closeBtn = checkoutModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                checkoutModal.classList.remove('show');
            };
        }

        // Close modal when clicking outside
        window.onclick = (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('show');
            }
        };
    }

    processOrder(shippingDetails) {
        try {
            // Here you would typically send the order to a backend server
            const orderDetails = {
                items: this.items,
                total: this.calculateTotal(),
                shipping: shippingDetails,
                orderId: 'ORD' + Date.now(),
                orderDate: new Date().toISOString()
            };

            console.log('Processing order:', orderDetails);

            // Clear cart first
            this.clearCart();

            // Show success message
            this.showMessage(`Order placed successfully! Order ID: ${orderDetails.orderId}`, 'success');

            // Reset form
            const checkoutForm = document.getElementById('checkoutForm');
            if (checkoutForm) {
                checkoutForm.reset();
            }

            // Save empty cart state
            this.saveCart();
            this.saveUserCart();

            return true;
        } catch (error) {
            console.error('Error processing order:', error);
            this.showMessage('Failed to process order. Please try again.', 'error');
            return false;
        }
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
        this.saveUserCart();
        this.updateCartDisplay();
        
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = '0';
        }
    }

    showMessage(message, type = 'success') {
        if (window.luxeStore) {
            window.luxeStore.showMessage(message, type);
        }
    }
}

// Initialize cart instance
let cartInstance = null;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - initializing cart');
    if (!cartInstance) {
        cartInstance = new Cart();
        window.cartManager = cartInstance;
    }
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    if (cartInstance) {
        console.log('Cleaning up cart instance');
        document.removeEventListener('click', cartInstance.handleCartClick);
        document.removeEventListener('click', cartInstance.handleCartControls);
        document.removeEventListener('click', cartInstance.handleCheckout);
    }
});

// Export only if needed for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cart;
}
