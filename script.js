// Main application controller
class LuxeStore {
    constructor() {
        this.products = [];
        this.currentSection = 'home';
        this.recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        this.newsletterEmails = JSON.parse(localStorage.getItem('newsletterEmails')) || [];
        this.isInitialized = false;
        
        // Initialize immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }

        // Fallback to hide loading overlay after 5 seconds
        setTimeout(() => {
            if (!this.isInitialized) {
                this.hideLoadingOverlay();
                console.warn('Application initialization timeout - forcing load');
            }
        }, 5000);
    }

    async init() {
        try {
            console.log('Initializing application...');
            
            // Load products first
            this.loadProducts();
            console.log('Products loaded:', this.products.length);

            // Initialize core functionality
            this.setupEventListeners();
            this.setupNavigation();
            this.setupScrollToTop();
            this.setupNewsletter();
            
            // Show initial section
            this.navigateToSection('home');
            
            // Render products
            this.renderProducts();
            console.log('Products rendered');

            // Initialize lazy loading
            this.initLazyLoading();

            this.isInitialized = true;
            this.hideLoadingOverlay();
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showMessage('Something went wrong. Please refresh the page.', 'error');
            this.hideLoadingOverlay();
        }
    }

    loadProducts() {
        // Hey! This is where we keep all our cool products
        // Each product has basic info like name, price, image etc.
        // Prices are in Pakistani Rupees (PKR)
        this.products = [
            {
                id: 1,
                name: "Premium Wireless Headphones",
                category: "electronics",
                price: 89999,  // PKR 89,999
                image: "https://pixabay.com/get/g317d93c88d6d2820d13e6552d94c1f92aacfbaa3bb39e0b35f5c07d3be008e5799307f6524ece86c5f5dac8a04b72ce3d0a5dacb4739d2afbfe3eb87a892478a_1280.jpg",
                description: "High-quality wireless headphones with premium sound and noise cancellation.",
                stock: 15  // Current stock count
            },
            {
                id: 2,
                name: "Wireless Earbuds",
                category: "electronics",
                price: 6999,
                image: "https://cdn.pixabay.com/photo/2020/05/14/09/54/earphones-5193970_1280.jpg",
                description: "Elegant smartwatch with advanced health monitoring and premium materials.",
                stock: 8
            },
            {
                id: 3,
                name: "T-Shirt",
                category: "fashion",
                price: 3999,
                image: "https://cdn.pixabay.com/photo/2024/04/29/04/21/tshirt-8726716_1280.jpg",
                description: "Exquisite designer handbag crafted from premium leather with elegant styling.",
                stock: 12
            },
            {
                id: 4,
                name: "Premium Coffee Machine",
                category: "home",
                price: 45999,
                image: "https://cdn.pixabay.com/photo/2016/12/05/22/23/coffee-1885073_1280.jpg",
                description: "Professional-grade coffee machine for the perfect brew every time.",
                stock: 6
            },
            {
                id: 5,
                name: "Premium Sunglasses",
                category: "accessories",
                price: 2999,
                image: "https://cdn.pixabay.com/photo/2017/07/13/14/05/wood-sunglasses-2500491_1280.jpg",
                description: "Exclusive fragrance collection with sophisticated scents.",
                stock: 20
            },
            {
                id: 6,
                name: "Ornamental Flowerpot",
                category: "home",
                price: 26999,
                image: "https://cdn.pixabay.com/photo/2020/07/22/19/45/ornamental-flowerpot-5429622_1280.jpg",
                description: "Handcrafted wooden bowl made from sustainable materials.",
                stock: 25
            },
            {
                id: 7,
                name: "Luxury Watch",
                category: "accessories",
                price: 104999,
                image: "https://cdn.pixabay.com/photo/2013/07/11/15/30/male-watch-144648_1280.jpg",
                description: "Designer sunglasses with UV protection and premium frames.",
                stock: 18
            },
            {
                id: 8,
                name: "Gold Bracelet",
                category: "accessories",
                price: 59999,
                image: "https://cdn.pixabay.com/photo/2013/07/11/15/22/bracelet-144646_1280.jpg",
                description: "Premium organic skincare collection for radiant skin.",
                stock: 14
            },
            {
                id: 9,
                name: "Bluetooth Speaker",
                category: "electronics",
                price: 38999,
                image: "https://cdn.pixabay.com/photo/2014/04/09/08/16/speaker-319842_1280.jpg",
                description: "High-end digital camera for professional photography.",
                stock: 5
            },
            {
                id: 10,
                name: "Jacket",
                category: "fashion",
                price: 8999,
                image: "https://cdn.pixabay.com/photo/2017/10/29/13/17/jacket-2899729_1280.png",
                description: "Limited edition designer sneakers with premium comfort.",
                stock: 22
            },
            {
                id: 11,
                name: "Luxury Tea Set",
                category: "home",
                price: 34999,
                image: "https://cdn.pixabay.com/photo/2021/11/26/00/46/tea-6824833_1280.jpg",
                description: "Elegant porcelain tea set perfect for special occasions.",
                stock: 16
            },
            {
                id: 12,
                name: "Perfume",
                category: "accessories",
                price: 6999,
                image: "https://cdn.pixabay.com/photo/2015/11/14/04/09/perfume-1042712_1280.jpg",
                description: "Handcrafted jewelry box with velvet interior and elegant design.",
                stock: 11
            },
            {
                id: 13,
                name: "Power Bank",
                category: "electronics",
                price: 8999,
                image: "https://cdn.pixabay.com/photo/2015/03/27/14/44/promotional-products-694794_1280.jpg",
                description: "Advanced smart home assistant with voice control and AI features.",
                stock: 30
            },
            {
                id: 14,
                name: "Trouser",
                category: "fashion",
                price: 1999,
                image: "https://cdn.pixabay.com/photo/2017/08/27/05/33/trousers-2685231_1280.jpg",
                description: "Premium designer jacket with modern styling and superior comfort.",
                stock: 9
            }
        ];

        // Let's show these products on the page!
        this.renderProducts();
    }

    setupEventListeners() {
        // Grab the menu button and nav for mobile view
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            // When someone clicks the menu button
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
            });

            // Close the menu if clicked outside
            document.addEventListener('click', (e) => {
                if (nav.classList.contains('active') && 
                    !nav.contains(e.target) && 
                    !menuToggle.contains(e.target)) {
                    nav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close menu after clicking a link (better UX)
            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Handle category filtering buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterProducts(category);
            });
        });

        // Make the navigation links work smoothly
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.navigateToSection(section);
            });
        });

        // Shop Now button in hero section
        const heroCta = document.querySelector('.hero-cta');
        if (heroCta) {
            heroCta.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('products');
            });
        }

        // Quick view functionality for products
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-quick-view')) {
                const productId = parseInt(e.target.dataset.productId);
                this.showQuickView(productId);
            }
        });

        // Close modal buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    setupNavigation() {
        // Main navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.navigateToSection(section);
            });
        });

        // Footer links navigation
        document.querySelectorAll('.footer-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                
                // If it's a category link, filter the products
                if (link.dataset.category) {
                    this.navigateToSection('products');
                    this.filterProducts(link.dataset.category);
                } else {
                    this.navigateToSection(section);
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
        });

        // Handle URL hash changes
        window.addEventListener('hashchange', () => {
            const section = window.location.hash.substring(1) || 'home';
            this.navigateToSection(section);
        });

        // Check initial hash
        const initialSection = window.location.hash.substring(1) || 'home';
        this.navigateToSection(initialSection);
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            this.currentSection = sectionId;

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Special handling for different sections
            if (sectionId === 'wishlist') {
                if (window.wishlistManager) {
                    window.wishlistManager.updateDisplay();
                }
            } else if (sectionId === 'cart') {
                if (window.cartManager) {
                    window.cartManager.updateCartDisplay();
                }
            }
        }
    }

    filterProducts(category) {
        console.log('Filtering products by category:', category);
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // Filter products
        let filteredProducts;
        if (category === 'all') {
            filteredProducts = this.products;
        } else {
            filteredProducts = this.products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }

        console.log('Filtered products:', filteredProducts.length);
        this.renderProducts(filteredProducts);
    }

    renderProducts(productsToRender = this.products) {
        console.log('Rendering products:', productsToRender.length);
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }

        // Clear existing content
        productsGrid.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>No products available in this category</p>
                </div>
            `;
            return;
        }

        // Create and append product cards
        productsToRender.forEach(product => {
            const card = this.createProductCard(product);
            productsGrid.appendChild(card);
        });

        // Initialize lazy loading for new product images
        this.initLazyLoading();
        
        // Show the products section if it was hidden
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.classList.remove('hidden');
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);

        // Check initial wishlist state
        const isInWishlist = window.wishlistManager ? window.wishlistManager.items.some(item => item.id === product.id) : false;

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="overlay-btn btn-quick-view" data-product-id="${product.id}" aria-label="Quick view ${product.name}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="overlay-btn btn-wishlist ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}" aria-label="Add to wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-category">${product.category}</div>
                <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="btn-add-cart" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
                ${product.stock <= 5 ? `<div class="low-stock">Only ${product.stock} left!</div>` : ''}
            </div>
        `;

        // Add event listeners
        const quickViewBtn = card.querySelector('.btn-quick-view');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', () => this.showQuickView(product.id));
        }

        const wishlistBtn = card.querySelector('.btn-wishlist');
        if (wishlistBtn && window.wishlistManager) {
            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.wishlistManager.toggleWishlist(product.id, wishlistBtn);
            });
        }

        const addToCartBtn = card.querySelector('.btn-add-cart');
        if (addToCartBtn && window.cartManager) {
            addToCartBtn.addEventListener('click', () => window.cartManager.addToCart(product.id));
        }

        return card;
    }

    showQuickView(productId) {
        const product = this.getProduct(productId);
        if (!product) return;

        const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(product.price).replace('₹', 'Rs.');

        const quickViewModal = document.createElement('div');
        quickViewModal.className = 'modal';
        quickViewModal.innerHTML = `
            <div class="modal-content quick-view">
                <span class="close">&times;</span>
                <div class="quick-view-content">
                    <div class="quick-view-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="quick-view-info">
                        <h2>${product.name}</h2>
                        <div class="product-category">${product.category}</div>
                        <div class="product-price">${formattedPrice}</div>
                        <div class="quick-view-description">${product.description}</div>
                        <div class="product-actions">
                            <button class="btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
                            <button class="btn-wishlist" data-product-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        ${product.stock <= 5 ? `<div class="low-stock">Only ${product.stock} left!</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(quickViewModal);
        
        // Setup close button
        const closeBtn = quickViewModal.querySelector('.close');
        closeBtn.onclick = () => {
            quickViewModal.remove();
        };

        // Setup wishlist button
        const wishlistBtn = quickViewModal.querySelector('.btn-wishlist');
        if (wishlistBtn && window.wishlistManager) {
            if (window.wishlistManager.isInWishlist(product.id)) {
                wishlistBtn.classList.add('active');
            }
            wishlistBtn.addEventListener('click', () => window.wishlistManager.toggleWishlist(product.id, wishlistBtn));
        }

        // Setup add to cart button
        const addToCartBtn = quickViewModal.querySelector('.btn-add-cart');
        if (addToCartBtn && window.cartManager) {
            addToCartBtn.addEventListener('click', () => window.cartManager.addToCart(product.id));
        }

        // Close on outside click
        quickViewModal.onclick = (e) => {
            if (e.target === quickViewModal) {
                quickViewModal.remove();
            }
        };

        // Show modal
        setTimeout(() => quickViewModal.classList.add('show'), 10);

        // Add to recently viewed
        this.addToRecentlyViewed(productId);
    }

    addToRecentlyViewed(productId) {
        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        
        // Remove if already exists
        recentlyViewed = recentlyViewed.filter(id => id !== productId);
        
        // Add to beginning
        recentlyViewed.unshift(productId);
        
        // Keep only last 6 items
        recentlyViewed = recentlyViewed.slice(0, 6);
        
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        this.recentlyViewed = recentlyViewed;
        
        this.updateRecentlyViewed();
    }

    updateRecentlyViewed() {
        const section = document.getElementById('recentlyViewed');
        const grid = document.getElementById('recentlyViewedGrid');
        
        if (this.recentlyViewed.length > 0) {
            section.classList.remove('hidden');
            grid.innerHTML = '';
            
            this.recentlyViewed.forEach(productId => {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    const card = this.createProductCard(product);
                    grid.appendChild(card);
                }
            });
        } else {
            section.classList.add('hidden');
        }
    }

    updateWishlistDisplay() {
        // This will be handled by the Wishlist class
        if (window.wishlistManager) {
            window.wishlistManager.updateDisplay();
        }
    }

    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setupNewsletter() {
        const form = document.getElementById('newsletterForm');
        const emailInput = document.getElementById('newsletterEmail');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            if (email && this.isValidEmail(email)) {
                this.subscribeNewsletter(email);
                emailInput.value = '';
                this.showMessage('Successfully subscribed to newsletter!', 'success');
            } else {
                this.showMessage('Please enter a valid email address.', 'error');
            }
        });
    }

    subscribeNewsletter(email) {
        if (!this.newsletterEmails.includes(email)) {
            this.newsletterEmails.push(email);
            localStorage.setItem('newsletterEmails', JSON.stringify(this.newsletterEmails));
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    initLazyLoading() {
        const images = document.querySelectorAll('.lazy-image');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    showMessage(message, type = 'success') {
        const messageEl = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
        const textEl = document.getElementById(type === 'success' ? 'successText' : 'errorText');
        
        textEl.textContent = message;
        messageEl.classList.add('show');
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    getProduct(id) {
        return this.products.find(p => p.id === parseInt(id));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.luxeStore = new LuxeStore();
});

// Export for use by other modules
window.LuxeStore = LuxeStore;
