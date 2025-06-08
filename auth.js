// Authentication module
class Auth {
    constructor() {
        // Get any saved user data when we start
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = null;
        
        this.init();
    }

    init() {
        // Set everything up when the page loads
        this.setupEventListeners();
        this.checkExistingSession();
        this.updateUI();
    }

    setupEventListeners() {
        // Watch for clicks on the login button
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.addEventListener('click', () => {
            this.showAuthModal('login');
        });

        // Handle logout clicks
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            this.logout();
        });

        // Watch for form submissions
        const loginForm = document.getElementById('loginFormElement');
        const signupForm = document.getElementById('signupFormElement');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();  // Don't refresh the page!
            this.handleLogin();
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();  // Don't refresh the page!
            this.handleSignup();
        });

        // Let users switch between login and signup
        document.getElementById('showSignup').addEventListener('click', () => {
            this.switchToSignup();
        });

        document.getElementById('showLogin').addEventListener('click', () => {
            this.switchToLogin();
        });
    }

    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        
        if (mode === 'login') {
            this.switchToLogin();
        } else {
            this.switchToSignup();
        }
        
        modal.classList.add('show');
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    switchToLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        this.clearFormErrors();
    }

    switchToSignup() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
        this.clearFormErrors();
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Clear previous errors
        this.clearFormErrors();

        if (!email || !password) {
            this.showFormError('Please fill in all fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showFormError('Please enter a valid email address.');
            return;
        }

        // Find user
        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            this.saveSession();
            this.updateUI();
            this.closeAuthModal();
            this.showMessage(`Welcome back, ${user.name}!`, 'success');
            
            // Sync cart and wishlist if user has data
            this.syncUserData();
        } else {
            this.showFormError('Invalid email or password.');
            this.shakeForm();
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        // Clear previous errors
        this.clearFormErrors();

        if (!name || !email || !password) {
            this.showFormError('Please fill in all fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showFormError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            this.showFormError('Password must be at least 6 characters long.');
            return;
        }

        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            this.showFormError('An account with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString(),
            cart: [],
            wishlist: []
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.currentUser = newUser;
        this.saveSession();
        this.updateUI();
        this.closeAuthModal();
        
        this.showMessage(`Welcome to LuxeStore, ${name}!`, 'success');
        
        // Trigger confetti for new user
        if (window.animationsManager) {
            window.animationsManager.triggerConfetti();
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('luxestore_session');
        this.updateUI();
        this.showMessage('Successfully logged out.', 'success');
        
        // Clear user-specific data from other modules
        if (window.cartManager) {
            window.cartManager.clearCart();
        }
        if (window.wishlistManager) {
            window.wishlistManager.clearWishlist();
        }
    }

    checkExistingSession() {
        const session = localStorage.getItem('luxestore_session');
        if (session) {
            try {
                const userData = JSON.parse(session);
                const user = this.users.find(u => u.id === userData.id);
                if (user) {
                    this.currentUser = user;
                }
            } catch (e) {
                localStorage.removeItem('luxestore_session');
            }
        }
    }

    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('luxestore_session', JSON.stringify({
                id: this.currentUser.id,
                email: this.currentUser.email,
                name: this.currentUser.name
            }));
        }
    }

    saveUsers() {
        localStorage.setItem('luxestore_users', JSON.stringify(this.users));
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userGreeting = document.getElementById('userGreeting');

        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userGreeting.classList.remove('hidden');
            userGreeting.textContent = `Hi, ${this.currentUser.name}`;
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userGreeting.classList.add('hidden');
        }
    }

    syncUserData() {
        if (!this.currentUser) return;

        // Sync cart
        if (window.cartManager && this.currentUser.cart) {
            window.cartManager.loadUserCart(this.currentUser.cart);
        }

        // Sync wishlist
        if (window.wishlistManager && this.currentUser.wishlist) {
            window.wishlistManager.loadUserWishlist(this.currentUser.wishlist);
        }
    }

    saveUserData() {
        if (!this.currentUser) return;

        // Save cart data
        if (window.cartManager) {
            this.currentUser.cart = window.cartManager.getCartItems();
        }

        // Save wishlist data
        if (window.wishlistManager) {
            this.currentUser.wishlist = window.wishlistManager.getWishlistItems();
        }

        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsers();
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.remove('show');
        this.clearForms();
    }

    clearForms() {
        document.getElementById('loginFormElement').reset();
        document.getElementById('signupFormElement').reset();
        this.clearFormErrors();
    }

    clearFormErrors() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('form-error');
        });
    }

    showFormError(message) {
        this.showMessage(message, 'error');
        
        // Add error class to inputs
        const activeForm = document.querySelector('.auth-form:not(.hidden)');
        activeForm.querySelectorAll('input').forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('form-error');
            }
        });
    }

    shakeForm() {
        const activeForm = document.querySelector('.auth-form:not(.hidden)');
        activeForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            activeForm.style.animation = '';
        }, 500);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(message, type = 'success') {
        if (window.luxeStore) {
            window.luxeStore.showMessage(message, type);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize and export
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new Auth();
});

window.Auth = Auth;
