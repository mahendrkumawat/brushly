// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeCartFunctionality();
    initializeScrollAnimations();
});

// Product filtering functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');

            // Get filter category
            const category = this.getAttribute('data-category');

            // Filter products with animation
            filterProducts(productCards, category);
        });
    });
}

// Filter products with smooth animation
function filterProducts(productCards, category) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            // Show matching products
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.remove('fade-out');
                card.classList.add('fade-in');
            }, 50);
        } else {
            // Hide non-matching products
            card.classList.remove('fade-in');
            card.classList.add('fade-out');
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Cart functionality
function initializeCartFunctionality() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    let cart = JSON.parse(localStorage.getItem('brushly-cart')) || [];

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;
            const productImage = productCard.querySelector('img').src;
            
            // Create product object
            const product = {
                id: Date.now(),
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            };

            // Add to cart
            addToCart(product);
            
            // Visual feedback
            showAddToCartFeedback(this);
        });
    });
}

// Add product to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('brushly-cart')) || [];
    
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.name === product.name);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    
    // Save to localStorage
    localStorage.setItem('brushly-cart', JSON.stringify(cart));
    
    console.log('Product added to cart:', product.name);
}

// Show visual feedback when adding to cart
function showAddToCartFeedback(button) {
    const originalText = button.textContent;
    
    // Change button text and style
    button.textContent = 'Added! ✓';
    button.style.background = 'linear-gradient(135deg, hsl(120 100% 40%) 0%, hsl(120 80% 50%) 100%)';
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = 'linear-gradient(135deg, hsl(220 100% 50%) 0%, hsl(220 80% 60%) 100%)';
    }, 2000);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards for scroll animation
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Search functionality (basic implementation)
function searchProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const searchLower = searchTerm.toLowerCase();
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (productName.includes(searchLower) || productDescription.includes(searchLower)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Price range filter (can be extended)
function filterByPriceRange(minPrice, maxPrice) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const priceText = card.querySelector('.current-price').textContent;
        const price = parseInt(priceText.replace('₹', '').replace(',', ''));
        
        if (price >= minPrice && price <= maxPrice) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Local storage utilities for cart management
const CartManager = {
    getCart: () => JSON.parse(localStorage.getItem('brushly-cart')) || [],
    
    saveCart: (cart) => localStorage.setItem('brushly-cart', JSON.stringify(cart)),
    
    addItem: (product) => {
        const cart = CartManager.getCart();
        const existingItem = cart.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        CartManager.saveCart(cart);
        return cart;
    },
    
    removeItem: (productName) => {
        let cart = CartManager.getCart();
        cart = cart.filter(item => item.name !== productName);
        CartManager.saveCart(cart);
        return cart;
    },
    
    updateQuantity: (productName, quantity) => {
        const cart = CartManager.getCart();
        const item = cart.find(item => item.name === productName);
        
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                return CartManager.removeItem(productName);
            }
        }
        
        CartManager.saveCart(cart);
        return cart;
    },
    
    clearCart: () => {
        localStorage.removeItem('brushly-cart');
        return [];
    },
    
    getTotal: () => {
        const cart = CartManager.getCart();
        return cart.reduce((total, item) => {
            const price = parseInt(item.price.replace('₹', '').replace(',', ''));
            return total + (price * item.quantity);
        }, 0);
    }
};

// Initialize the application
console.log('Brushly Oral Care Catalog Initialized');
console.log('Cart functionality ready');
