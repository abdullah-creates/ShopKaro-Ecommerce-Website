// Wishlist module
class Wishlist {
    constructor() {
        this.items = [];
        
        this.init();
    }

    init() {
        this.loadWishlist();
        this.setupEventListeners();
        this.updateWishlistButtons();
    }

    setupEventListeners() {
        // Wishlist buttons (event delegation)
        document.addEventListener('click', (e) => {
            let button = null;
            let target = e.target;
            
            // Check if target is a wishlist button or inside one
            while (target && target !== document) {
                if (target.classList && (target.classList.contains('btn-wishlist') || target.classList.contains('btn-wishlist-overlay'))) {
                    button = target;
                    break;
                }
                target = target.parentElement;
            }
            
            if (button) {
                const productId = parseInt(button.dataset.productId);
                this.toggleWishlist(productId, button);
            }
        });
    }

    toggleWishlist(productId, buttonElement) {
        const product = window.luxeStore.getProduct(productId);
        if (!product) return;

        // Check if the product is in the wishlist array
        const existingItem = this.items.find(item => item.id === productId);
        
        if (!existingItem) {
            // Add to wishlist if not in array
            this.items.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                description: product.description,
                stock: product.stock,
                addedAt: new Date().toISOString()
            });
            this.showMessage(`${product.name} added to wishlist!`, 'success');
            buttonElement.classList.add('active');
            this.animateHeartFill(buttonElement);
        } else {
            // Remove from wishlist if already in array
            this.items = this.items.filter(item => item.id !== productId);
            this.showMessage(`${product.name} removed from wishlist`, 'success');
            buttonElement.classList.remove('active');
            this.animateHeartEmpty(buttonElement);
        }

        this.saveWishlist();
        this.updateWishlistButtons();
        this.saveUserWishlist();
        
        // Update wishlist display if currently viewing
        if (window.luxeStore.currentSection === 'wishlist') {
            this.updateDisplay();
        }
    }

    animateHeartFill(buttonElement) {
        const heartIcon = buttonElement.querySelector('i');
        if (heartIcon) {
            heartIcon.style.animation = 'heartBeat 0.5s ease-in-out';
            buttonElement.classList.add('active');
            
            // Create floating heart effect
            this.createFloatingHeart(buttonElement);
            
            setTimeout(() => {
                heartIcon.style.animation = '';
            }, 500);
        }
    }

    animateHeartEmpty(buttonElement) {
        const heartIcon = buttonElement.querySelector('i');
        if (heartIcon) {
            buttonElement.classList.remove('active');
            
            // Subtle scale animation
            heartIcon.style.animation = 'heartBreak 0.3s ease-in-out';
            setTimeout(() => {
                heartIcon.style.animation = '';
            }, 300);
        }
    }

    createFloatingHeart(sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        
        // Create floating heart
        const floatingHeart = document.createElement('div');
        floatingHeart.innerHTML = '❤️';
        floatingHeart.style.position = 'fixed';
        floatingHeart.style.left = rect.left + rect.width / 2 + 'px';
        floatingHeart.style.top = rect.top + 'px';
        floatingHeart.style.fontSize = '20px';
        floatingHeart.style.pointerEvents = 'none';
        floatingHeart.style.zIndex = '3000';
        
        document.body.appendChild(floatingHeart);

        // Animate upward
        floatingHeart.animate([
            { 
                transform: 'translateY(0) scale(1)',
                opacity: 1
            },
            { 
                transform: 'translateY(-50px) scale(1.5)',
                opacity: 0
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            floatingHeart.remove();
        });
    }

    updateWishlistButtons() {
        // Update all wishlist buttons to reflect current state
        document.querySelectorAll('.btn-wishlist, .btn-wishlist-overlay').forEach(button => {
            const productId = parseInt(button.dataset.productId);
            const isInWishlist = this.items.some(item => item.id === productId);
            
            if (isInWishlist) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    updateDisplay() {
        const grid = document.getElementById('wishlistGrid');
        const emptyWishlist = document.getElementById('emptyWishlist');
        
        if (!grid || !emptyWishlist) {
            console.error('Wishlist elements not found');
            return;
        }

        if (this.items.length === 0) {
            grid.style.display = 'none';
            emptyWishlist.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        emptyWishlist.style.display = 'none';

        // Sort by most recently added
        const sortedItems = [...this.items].sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );

        grid.innerHTML = sortedItems.map(item => this.createWishlistCard(item)).join('');

        // Add event listeners to the new cards
        grid.querySelectorAll('.product-card').forEach(card => {
            const productId = parseInt(card.dataset.productId);

            // Quick view button
            const quickViewBtn = card.querySelector('.btn-quick-view');
            if (quickViewBtn && window.luxeStore) {
                quickViewBtn.addEventListener('click', () => window.luxeStore.showQuickView(productId));
            }

            // Wishlist button
            const wishlistBtn = card.querySelector('.btn-wishlist-overlay, .btn-wishlist');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', () => this.toggleWishlist(productId, wishlistBtn));
            }

            // Add to cart button
            const addToCartBtn = card.querySelector('.btn-add-cart');
            if (addToCartBtn && window.cartManager) {
                addToCartBtn.addEventListener('click', () => window.cartManager.addToCart(productId));
            }
        });

        // Initialize lazy loading for wishlist images
        if (window.luxeStore) {
            window.luxeStore.initLazyLoading();
        }
    }

    createWishlistCard(product) {
        const isLowStock = product.stock <= 10;
        const lowStockBadge = isLowStock ? `<div class="low-stock">Only ${product.stock} left!</div>` : '';

        return `
            <div class="product-card" data-product-id="${product.id}">
                ${lowStockBadge}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" class="lazy-image" loading="lazy">
                    <div class="product-overlay">
                        <button class="overlay-btn btn-quick-view" data-product-id="${product.id}" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="overlay-btn btn-wishlist-overlay active" data-product-id="${product.id}" title="Remove from Wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
                    <div class="product-actions">
                        <button class="btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
                        <button class="btn-wishlist active" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadWishlist() {
        const savedWishlist = localStorage.getItem('luxestore_wishlist');
        if (savedWishlist) {
            try {
                this.items = JSON.parse(savedWishlist);
                // Update buttons after loading wishlist
                this.updateWishlistButtons();
            } catch (e) {
                console.error('Error loading wishlist:', e);
                this.items = [];
            }
        } else {
            this.items = [];
        }
    }

    saveWishlist() {
        try {
            localStorage.setItem('luxestore_wishlist', JSON.stringify(this.items));
        } catch (e) {
            console.error('Error saving wishlist:', e);
        }
    }

    saveUserWishlist() {
        if (window.authManager && window.authManager.getCurrentUser()) {
            window.authManager.saveUserData();
        }
    }

    loadUserWishlist(wishlistData) {
        if (wishlistData && Array.isArray(wishlistData)) {
            this.items = wishlistData;
            this.saveWishlist();
            this.updateWishlistButtons();
            
            if (window.luxeStore.currentSection === 'wishlist') {
                this.updateDisplay();
            }
        }
    }

    getWishlistItems() {
        return this.items;
    }

    clearWishlist() {
        this.items = [];
        this.saveWishlist();
        this.updateWishlistButtons();
        this.updateDisplay();
    }

    isInWishlist(productId) {
        return this.items.some(item => item.id === parseInt(productId));
    }

    getWishlistCount() {
        return this.items.length;
    }

    showMessage(message, type = 'success') {
        const messageEl = document.getElementById(`${type}Message`);
        const textEl = document.getElementById(`${type}Text`);
        if (messageEl && textEl) {
            textEl.textContent = message;
            messageEl.classList.add('show');
            setTimeout(() => messageEl.classList.remove('show'), 3000);
        }
    }
}

// Add CSS animations for heart effects
const style = document.createElement('style');
style.textContent = `
    @keyframes heartBreak {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.8); }
    }
`;
document.head.appendChild(style);

// Initialize and export
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistManager = new Wishlist();
});

window.Wishlist = Wishlist;
