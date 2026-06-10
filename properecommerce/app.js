/* --- AURA & CO. MAIN CONTROLLER --- */

(function () {
  'use strict';

  // --- STATE MANAGEMENT ---
  const state = {
    products: window.PRODUCTS || [],
    filters: {
      categories: [],
      materials: [],
      maxPrice: 10000,
      searchQuery: '',
      sortBy: 'featured'
    },
    cart: [],
    wishlist: [],
    promoApplied: false,
    promoCode: '',
    discountPercentage: 0,
    activeProductId: null,
    activeProductQty: 1,
    checkoutStep: 1
  };

  // --- DOM HELPER FUNCTIONS (Strictly secure, avoiding innerHTML) ---

  /**
   * Helper to programmatically create DOM Elements with attributes and children
   */
  function el(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);

    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'class') {
        element.className = val;
      } else if (key.startsWith('on') && typeof val === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, val);
      } else {
        element.setAttribute(key, val);
      }
    }

    for (const child of children) {
      if (child === null || child === undefined) continue;
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child.toString()));
      } else if (child instanceof HTMLElement || child instanceof SVGElement) {
        element.appendChild(child);
      }
    }

    return element;
  }

  /**
   * Parses static SVG strings safely using DOMParser
   */
  function svg(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    // Check for parsing errors
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.error('Error parsing SVG string', errorNode.textContent);
      return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    }

    return doc.documentElement;
  }

  // Predefined SVG definitions to avoid innerHTML for icons
  const ICONS = {
    heart: svg(`<svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`),
    trash: svg(`<svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`),
    star: '★',
    close: svg(`<svg class="icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`)
  };

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    setupEventListeners();
    loadSession();
    renderProducts();
    updateBadges();
    initFallingDiamonds();
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Header scrolled state
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      if (window.scrollY > 20) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    });

    // Drawer toggles
    document.getElementById('cart-toggle-btn').addEventListener('click', () => toggleCart(true));
    document.getElementById('close-cart-btn').addEventListener('click', () => toggleCart(false));
    document.getElementById('wishlist-toggle-btn').addEventListener('click', () => toggleWishlistDrawer(true));
    document.getElementById('close-wishlist-btn').addEventListener('click', () => toggleWishlistDrawer(false));
    document.getElementById('overlay-backdrop').addEventListener('click', closeAllDrawersAndModals);

    // Search action
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      state.filters.searchQuery = e.target.value.trim();
      renderProducts();
      updateSearchStatus();
    });

    document.getElementById('clear-search-btn').addEventListener('click', () => {
      state.filters.searchQuery = '';
      searchInput.value = '';
      renderProducts();
      updateSearchStatus();
    });

    // Catalog category filters
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(box => {
      box.addEventListener('change', () => {
        const name = box.name;
        const val = box.value;

        if (name === 'category') {
          if (box.checked) {
            state.filters.categories.push(val);
          } else {
            state.filters.categories = state.filters.categories.filter(c => c !== val);
          }
        } else if (name === 'material') {
          if (box.checked) {
            state.filters.materials.push(val);
          } else {
            state.filters.materials = state.filters.materials.filter(m => m !== val);
          }
        }
        renderProducts();
      });
    });

    // Price range filter
    const priceRange = document.getElementById('price-range');
    priceRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.filters.maxPrice = val;
      document.getElementById('price-range-value').textContent = `$${val}`;
      renderProducts();
    });

    // Sort select filter
    document.getElementById('sort-select').addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderProducts();
    });

    // Reset filters
    document.getElementById('clear-filters-btn').addEventListener('click', resetAllFilters);
    document.getElementById('reset-filters-shortcut').addEventListener('click', resetAllFilters);

    // Collection cards quick navigation
    const colCards = document.querySelectorAll('.collection-card');
    colCards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.category;
        resetAllFilters();

        // Check matching checkbox
        const checkbox = document.querySelector(`.filter-checkbox[value="${cat}"]`);
        if (checkbox) {
          checkbox.checked = true;
          state.filters.categories.push(cat);
          renderProducts();

          // Scroll to catalog
          document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Modal Details Actions
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('qty-dec-btn').addEventListener('click', () => updateModalQty(-1));
    document.getElementById('qty-inc-btn').addEventListener('click', () => updateModalQty(1));
    document.getElementById('modal-add-btn').addEventListener('click', addActiveProductToCart);

    // Wishlist actions
    document.getElementById('add-wishlist-all-btn').addEventListener('click', addAllWishlistToCart);

    // Promo Code
    document.getElementById('apply-promo-btn').addEventListener('click', applyPromoCode);

    // Checkout Modal Toggles
    document.getElementById('checkout-btn').addEventListener('click', openCheckout);
    document.getElementById('close-checkout-btn').addEventListener('click', closeCheckout);

    // Checkout Step 1: Shipping
    document.getElementById('shipping-form').addEventListener('submit', (e) => {
      e.preventDefault();
      setCheckoutStep(2);
    });

    // Checkout Step 2: Payment
    document.getElementById('back-to-shipping-btn').addEventListener('click', () => {
      setCheckoutStep(1);
    });

    document.getElementById('payment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      authorizeMockPayment();
    });

    // Checkout Card Fields Input Listener for Virtual Card Sync
    setupCreditCardSync();

    // Success close
    document.getElementById('success-done-btn').addEventListener('click', () => {
      closeCheckout();
      setCheckoutStep(1);
    });
  }

  // --- LOCAL SESSION CACHE ---
  function loadSession() {
    try {
      const savedCart = localStorage.getItem('jd_cart');
      const savedWishlist = localStorage.getItem('jd_wishlist');

      if (savedCart) state.cart = JSON.parse(savedCart);
      if (savedWishlist) state.wishlist = JSON.parse(savedWishlist);
    } catch (e) {
      console.warn('Failed to load session from localStorage', e);
    }
  }

  function saveSession() {
    try {
      localStorage.setItem('jd_cart', JSON.stringify(state.cart));
      localStorage.setItem('jd_wishlist', JSON.stringify(state.wishlist));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
  }

  // --- RENDERING PRODUCTS IN GRID ---
  function renderProducts() {
    const grid = document.getElementById('product-grid');
    const emptyView = document.getElementById('empty-catalog-view');
    grid.replaceChildren();

    // Filter logic
    let filtered = state.products.filter(prod => {
      // Category filter
      if (state.filters.categories.length > 0 && !state.filters.categories.includes(prod.category)) {
        return false;
      }
      // Material filter
      if (state.filters.materials.length > 0 && !state.filters.materials.includes(prod.material)) {
        return false;
      }
      // Max Price filter
      if (prod.price > state.filters.maxPrice) {
        return false;
      }
      // Search Query filter
      if (state.filters.searchQuery !== '') {
        const query = state.filters.searchQuery.toLowerCase();
        const matchesTitle = prod.title.toLowerCase().includes(query);
        const matchesDesc = prod.description.toLowerCase().includes(query);
        const matchesMat = prod.material.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesMat) {
          return false;
        }
      }
      return true;
    });

    // Sorting logic
    if (state.filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (state.filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (state.filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } // 'featured' retains original order

    if (filtered.length === 0) {
      emptyView.classList.remove('hidden');
      grid.classList.add('hidden');
      return;
    }

    emptyView.classList.add('hidden');
    grid.classList.remove('hidden');

    // Build Product cards securely
    filtered.forEach(product => {
      const isWished = state.wishlist.includes(product.id);

      // Heart Button
      const wishBtn = el('button', {
        class: `product-card-wish-btn${isWished ? ' active' : ''}`,
        'aria-label': isWished ? 'Remove from wishlist' : 'Add to wishlist',
        onclick: (e) => {
          e.stopPropagation();
          toggleProductWish(product.id, wishBtn);
        }
      }, [ICONS.heart.cloneNode(true)]);

      // Quick Add Button
      const quickAddBtn = el('button', {
        class: 'product-card-quick-add',
        onclick: (e) => {
          e.stopPropagation();
          addToCart(product.id, 1);
        }
      }, ['Quick Add']);

      // Card Media Wrapper
      const mediaWrapper = el('div', {
        class: 'product-card-media',
        onclick: () => openProductModal(product.id)
      }, [
        el('img', { src: product.image, alt: product.title, loading: 'lazy' }),
        wishBtn,
        quickAddBtn
      ]);

      // Details block
      const categoryLabel = el('span', { class: 'product-card-category' }, [product.category]);
      const cardTitle = el('h3', {
        class: 'product-card-title',
        onclick: () => openProductModal(product.id)
      }, [product.title]);

      const ratingStars = el('span', { class: 'stars' }, [ICONS.star.repeat(Math.round(product.rating))]);
      const ratingLabel = el('div', { class: 'product-card-rating' }, [
        ratingStars,
        el('span', { class: 'reviews-count' }, [`(${product.reviewsCount})`])
      ]);

      const priceLabel = el('span', { class: 'product-card-price' }, [`$${product.price}`]);

      const metaRow = el('div', { class: 'product-card-meta' }, [
        priceLabel,
        ratingLabel
      ]);

      const infoWrapper = el('div', { class: 'product-card-info' }, [
        categoryLabel,
        cardTitle,
        metaRow
      ]);

      const card = el('article', { class: 'product-card' }, [
        mediaWrapper,
        infoWrapper
      ]);

      grid.appendChild(card);
    });
  }

  function resetAllFilters() {
    state.filters.categories = [];
    state.filters.materials = [];
    state.filters.maxPrice = 10000;
    state.filters.searchQuery = '';
    state.filters.sortBy = 'featured';

    // Reset DOM indicators
    document.querySelectorAll('.filter-checkbox').forEach(box => box.checked = false);
    document.getElementById('price-range').value = 10000;
    document.getElementById('price-range-value').textContent = '$10000';
    document.getElementById('sort-select').value = 'featured';
    document.getElementById('search-input').value = '';

    renderProducts();
    updateSearchStatus();
  }

  function updateSearchStatus() {
    const bar = document.getElementById('search-status-bar');
    const text = document.getElementById('search-status-text');

    if (state.filters.searchQuery) {
      text.textContent = `Search results for "${state.filters.searchQuery}"`;
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }

  // --- WISHLIST MANAGEMENT ---
  function toggleProductWish(productId, buttonEl) {
    const index = state.wishlist.indexOf(productId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      if (buttonEl) {
        buttonEl.classList.remove('active');
        buttonEl.setAttribute('aria-label', 'Add to wishlist');
      }
    } else {
      state.wishlist.push(productId);
      if (buttonEl) {
        buttonEl.classList.add('active');
        buttonEl.setAttribute('aria-label', 'Remove from wishlist');
      }
      animateBadge('wishlist-badge');
    }

    saveSession();
    updateBadges();
    renderWishlistItems();
  }

  function renderWishlistItems() {
    const container = document.getElementById('wishlist-items-container');
    container.replaceChildren();

    if (state.wishlist.length === 0) {
      container.appendChild(el('div', { class: 'empty-state-drawer' }, [
        el('p', {}, ['Your wishlist is empty.']),
        el('button', {
          class: 'text-btn',
          onclick: () => {
            toggleWishlistDrawer(false);
            document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
          }
        }, ['Start browsing'])
      ]));
      return;
    }

    state.wishlist.forEach(id => {
      const prod = state.products.find(p => p.id === id);
      if (!prod) return;

      const imgNode = el('img', { src: prod.image, alt: prod.title, class: 'wishlist-item-img' });

      const detailsNode = el('div', { class: 'wishlist-item-info' }, [
        el('h4', { class: 'wishlist-item-title' }, [prod.title]),
        el('div', { class: 'wishlist-item-price' }, [`$${prod.price}`])
      ]);

      const addBtn = el('button', {
        class: 'wishlist-item-btn-add',
        onclick: () => {
          addToCart(prod.id, 1);
          toggleProductWish(prod.id); // remove from wishlist once added
        }
      }, ['Add to Cart']);

      const removeBtn = el('button', {
        class: 'wishlist-item-remove',
        'aria-label': 'Remove item',
        onclick: () => toggleProductWish(prod.id)
      }, ['\u00D7']); // Multi symbol multiplication/times x

      const card = el('div', { class: 'wishlist-item-card' }, [
        imgNode,
        detailsNode,
        addBtn,
        removeBtn
      ]);

      container.appendChild(card);
    });
  }

  function addAllWishlistToCart() {
    if (state.wishlist.length === 0) return;

    state.wishlist.forEach(id => {
      addToCart(id, 1, false); // add without triggering drawer
    });

    state.wishlist = [];
    saveSession();
    updateBadges();
    renderWishlistItems();
    renderProducts(); // Update heart styles
    toggleWishlistDrawer(false);
    toggleCart(true); // Open cart drawer
  }

  // --- CART MANAGEMENT ---
  function addToCart(productId, qty, openDrawer = true) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.find(item => item.product.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({ product, quantity: qty });
    }

    saveSession();
    updateBadges();
    renderCartItems();
    animateBadge('cart-badge');

    if (openDrawer) {
      closeAllDrawersAndModals();
      toggleCart(true);
    }
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.product.id !== productId);
    }

    saveSession();
    updateBadges();
    renderCartItems();
  }

  function removeCartItem(productId) {
    state.cart = state.cart.filter(i => i.product.id !== productId);
    saveSession();
    updateBadges();
    renderCartItems();
  }

  function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.replaceChildren();

    if (state.cart.length === 0) {
      container.appendChild(el('div', { class: 'empty-state-drawer' }, [
        el('p', {}, ['Your shopping cart is empty.']),
        el('button', {
          class: 'btn btn-secondary btn-full',
          onclick: () => {
            toggleCart(false);
            document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
          }
        }, ['Continue Shopping'])
      ]));

      document.getElementById('checkout-btn').disabled = true;
      updateCartTotals();
      return;
    }

    document.getElementById('checkout-btn').disabled = false;

    state.cart.forEach(item => {
      const prod = item.product;

      const imgNode = el('img', { src: prod.image, alt: prod.title, class: 'cart-item-img' });

      const titleNode = el('h4', { class: 'cart-item-title' }, [prod.title]);
      const metaNode = el('span', { class: 'cart-item-meta' }, [`Material: ${prod.material}`]);
      const priceNode = el('div', { class: 'cart-item-price' }, [`$${prod.price}`]);

      // Quantity adjustments
      const decBtn = el('button', {
        class: 'cart-qty-btn',
        onclick: () => updateCartQty(prod.id, -1)
      }, ['-']);

      const qtyLabel = el('span', { class: 'cart-qty-val' }, [item.quantity]);

      const incBtn = el('button', {
        class: 'cart-qty-btn',
        onclick: () => updateCartQty(prod.id, 1)
      }, ['+']);

      const counter = el('div', { class: 'cart-qty-counter' }, [
        decBtn,
        qtyLabel,
        incBtn
      ]);

      const removeBtn = el('button', {
        class: 'cart-item-remove-btn',
        onclick: () => removeCartItem(prod.id)
      }, ['Remove']);

      const actionsRow = el('div', { class: 'cart-item-actions' }, [
        counter,
        removeBtn
      ]);

      const detailsNode = el('div', { class: 'cart-item-details' }, [
        titleNode,
        metaNode,
        priceNode,
        actionsRow
      ]);

      const card = el('div', { class: 'cart-item-card' }, [
        imgNode,
        detailsNode
      ]);

      container.appendChild(card);
    });

    updateCartTotals();
  }

  function updateCartTotals() {
    let subtotal = 0;
    state.cart.forEach(item => {
      subtotal += item.product.price * item.quantity;
    });

    let discount = subtotal * state.discountPercentage;
    let total = subtotal - discount;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;

    const discLine = document.getElementById('cart-discount-line');
    const discVal = document.getElementById('cart-discount');
    if (state.discountPercentage > 0) {
      discVal.textContent = `-$${discount.toFixed(2)}`;
      discLine.classList.remove('hidden');
    } else {
      discLine.classList.add('hidden');
    }

    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  }

  function applyPromoCode() {
    const input = document.getElementById('promo-input');
    const msg = document.getElementById('promo-msg');
    const code = input.value.trim().toUpperCase();

    if (code === 'WELCOME10') {
      state.promoApplied = true;
      state.promoCode = code;
      state.discountPercentage = 0.10;
      msg.textContent = 'Promo code WELCOME10 applied! (10% Off)';
      msg.className = 'promo-feedback text-success';
    } else if (code === 'JDICED') {
      state.promoApplied = true;
      state.promoCode = code;
      state.discountPercentage = 0.15;
      msg.textContent = 'Promo code JDICED applied! (15% Off)';
      msg.className = 'promo-feedback text-success';
    } else {
      msg.textContent = 'Invalid promo code.';
      msg.className = 'promo-feedback text-error';
    }

    msg.classList.remove('hidden');
    updateCartTotals();
  }

  // --- BADGE UPDATES ---
  function updateBadges() {
    // Cart sum
    let cartSum = 0;
    state.cart.forEach(item => cartSum += item.quantity);
    document.getElementById('cart-badge').textContent = cartSum.toString();

    // Wishlist sum
    document.getElementById('wishlist-badge').textContent = state.wishlist.length.toString();
  }

  function animateBadge(id) {
    const badge = document.getElementById(id);
    badge.classList.remove('badge-bounce');
    // Force reflow
    void badge.offsetWidth;
    badge.classList.add('badge-bounce');
  }

  // --- DRAWERS & DIALOGS WINDOW CONTROLS ---
  function toggleCart(show) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('overlay-backdrop');

    if (show) {
      closeAllDrawersAndModals();
      renderCartItems();
      drawer.classList.remove('hidden');
      // Trigger reflow
      void drawer.offsetWidth;
      drawer.classList.add('active');
      backdrop.classList.remove('hidden');
    } else {
      drawer.classList.remove('active');
      backdrop.classList.add('hidden');
      setTimeout(() => drawer.classList.add('hidden'), 400);
    }
  }

  function toggleWishlistDrawer(show) {
    const drawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('overlay-backdrop');

    if (show) {
      closeAllDrawersAndModals();
      renderWishlistItems();
      drawer.classList.remove('hidden');
      void drawer.offsetWidth;
      drawer.classList.add('active');
      backdrop.classList.remove('hidden');
    } else {
      drawer.classList.remove('active');
      backdrop.classList.add('hidden');
      setTimeout(() => drawer.classList.add('hidden'), 400);
    }
  }

  function closeAllDrawersAndModals() {
    // Close cart
    const cart = document.getElementById('cart-drawer');
    cart.classList.remove('active');
    setTimeout(() => cart.classList.add('hidden'), 400);

    // Close wishlist
    const wish = document.getElementById('wishlist-drawer');
    wish.classList.remove('active');
    setTimeout(() => wish.classList.add('hidden'), 400);

    // Close product modal
    closeModal();

    // Hide backdrop
    document.getElementById('overlay-backdrop').classList.add('hidden');
  }

  // --- PRODUCT MODAL ---
  function openProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.activeProductId = productId;
    state.activeProductQty = 1;

    // Fill details
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-stars').textContent = ICONS.star.repeat(Math.round(product.rating));
    document.getElementById('modal-reviews-count').textContent = `(${product.reviewsCount} customer reviews)`;
    document.getElementById('modal-price').textContent = `$${product.price}`;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-qty-value').textContent = '1';

    // Image gallery
    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = product.image;
    mainImg.alt = product.title;

    // Thumbnails rendering
    const thumbRow = document.getElementById('modal-thumbnails');
    thumbRow.replaceChildren();

    product.thumbnails.forEach((src, idx) => {
      const btn = el('button', {
        class: `thumb-btn${idx === 0 ? ' active' : ''}`,
        onclick: () => {
          mainImg.src = src;
          // Toggle active class on siblings
          const siblings = thumbRow.querySelectorAll('.thumb-btn');
          siblings.forEach(s => s.classList.remove('active'));
          btn.classList.add('active');
        }
      }, [
        el('img', { src, alt: `${product.title} view ${idx + 1}` })
      ]);
      thumbRow.appendChild(btn);
    });

    // Specifications listing
    const specsList = document.getElementById('modal-specs-list');
    specsList.replaceChildren();

    for (const [key, val] of Object.entries(product.specs)) {
      // Format key from camelCase to Title case
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      specsList.appendChild(
        el('li', {}, [
          el('strong', {}, [`${label}: `]),
          val
        ])
      );
    }

    // Care instructions
    document.getElementById('modal-care-text').textContent = product.care;

    // Show modal
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    document.getElementById('overlay-backdrop').classList.remove('hidden');
  }

  function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    state.activeProductId = null;
  }

  function updateModalQty(delta) {
    state.activeProductQty += delta;
    if (state.activeProductQty < 1) state.activeProductQty = 1;
    document.getElementById('modal-qty-value').textContent = state.activeProductQty.toString();
  }

  function addActiveProductToCart() {
    if (!state.activeProductId) return;
    addToCart(state.activeProductId, state.activeProductQty);
    closeModal();
  }

  // --- CHECKOUT FLOW ---
  function openCheckout() {
    if (state.cart.length === 0) return;

    closeAllDrawersAndModals();
    renderCheckoutSummary();

    const checkout = document.getElementById('checkout-modal');
    checkout.classList.remove('hidden');
    setCheckoutStep(1);
  }

  function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
  }

  function setCheckoutStep(step) {
    state.checkoutStep = step;

    // Toggle active screen classes
    document.getElementById('checkout-step-1').classList.toggle('hidden', step !== 1);
    document.getElementById('checkout-step-2').classList.toggle('hidden', step !== 2);
    document.getElementById('checkout-step-3').classList.toggle('hidden', step !== 3);

    // Update step buttons / indicator
    document.getElementById('step-lbl-1').classList.toggle('active', step === 1);
    document.getElementById('step-lbl-2').classList.toggle('active', step === 2);
    document.getElementById('step-lbl-3').classList.toggle('active', step === 3);

    // Reset card side states on load
    if (step === 2) {
      document.getElementById('virtual-card').classList.remove('flipped');
    }
  }

  function renderCheckoutSummary() {
    const list = document.getElementById('checkout-summary-items');
    list.replaceChildren();

    let subtotal = 0;
    state.cart.forEach(item => {
      subtotal += item.product.price * item.quantity;

      const qtyLabel = el('span', { class: 'name-qty' }, [`${item.product.title} x${item.quantity}`]);
      const priceLabel = el('span', { class: 'price' }, [`$${(item.product.price * item.quantity).toFixed(2)}`]);

      list.appendChild(
        el('div', { class: 'summary-item' }, [
          qtyLabel,
          priceLabel
        ])
      );
    });

    let discount = subtotal * state.discountPercentage;
    let total = subtotal - discount;

    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;

    const discLine = document.getElementById('summary-discount-line');
    const discVal = document.getElementById('summary-discount');
    if (state.discountPercentage > 0) {
      discVal.textContent = `-$${discount.toFixed(2)}`;
      discLine.classList.remove('hidden');
    } else {
      discLine.classList.add('hidden');
    }

    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
  }

  // --- VIRTUAL CREDIT CARD INTERACTION LOGIC ---
  function setupCreditCardSync() {
    const cardNumInput = document.getElementById('payment-card-number');
    const cardNameInput = document.getElementById('payment-card-name');
    const cardExpiryInput = document.getElementById('payment-card-expiry');
    const cardCvvInput = document.getElementById('payment-card-cvv');

    const vNum = document.getElementById('v-card-number');
    const vName = document.getElementById('v-card-name');
    const vExpiry = document.getElementById('v-card-expiry');
    const vCvv = document.getElementById('v-card-cvv');
    const vCard = document.getElementById('virtual-card');
    const vLogo = document.getElementById('v-card-logo');

    // Sync card numbers with automatic formatting (e.g. 4000 1234 5678 9000)
    cardNumInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';

      // Determine card brand logo
      if (val.startsWith('4')) {
        vLogo.textContent = 'VISA';
      } else if (val.startsWith('5')) {
        vLogo.textContent = 'MASTERCARD';
      } else if (val.startsWith('3')) {
        vLogo.textContent = 'AMEX';
      } else {
        vLogo.textContent = 'CARD';
      }

      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }

      e.target.value = formatted;

      // Update visual number
      let displayVal = formatted;
      while (displayVal.length < 19) {
        let len = displayVal.length;
        if (len === 4 || len === 9 || len === 14) {
          displayVal += ' ';
        } else {
          displayVal += '•';
        }
      }
      vNum.textContent = displayVal;
    });

    // Sync cardholder name
    cardNameInput.addEventListener('input', (e) => {
      let val = e.target.value.toUpperCase();
      vName.textContent = val || 'YOUR NAME';
    });

    // Sync expiration date (e.g. MM/YY)
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.slice(0, 2) + '/' + val.slice(2, 4);
      }
      e.target.value = val;
      vExpiry.textContent = val || 'MM/YY';
    });

    // Flip card to back on CVV focus, back to front on blur
    cardCvvInput.addEventListener('focus', () => {
      vCard.classList.add('flipped');
    });

    cardCvvInput.addEventListener('blur', () => {
      vCard.classList.remove('flipped');
    });

    cardCvvInput.addEventListener('input', (e) => {
      let val = e.target.value;
      let bullets = '•'.repeat(val.length);
      vCvv.textContent = bullets || '•••';
    });
  }

  // --- MOCK AUTHORIZE ACTION ---
  function authorizeMockPayment() {
    const cardNum = document.getElementById('payment-card-number').value.replace(/\s/g, '');
    const cvv = document.getElementById('payment-card-cvv').value;
    const expiry = document.getElementById('payment-card-expiry').value;
    const name = document.getElementById('payment-card-name').value;
    const email = document.getElementById('shipping-email').value;

    // Simple format checks before mock success
    if (cardNum.length < 13 || isNaN(cardNum)) {
      alertSecure('Please enter a valid credit card number.');
      return;
    }

    if (!expiry.includes('/') || expiry.length < 5) {
      alertSecure('Please enter expiry in MM/YY format.');
      return;
    }

    if (cvv.length < 3 || isNaN(cvv)) {
      alertSecure('Please enter a valid CVV.');
      return;
    }

    // Mock validation logic success: generate receipts
    const orderNo = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + 7);

    const deliveryOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = delivery.toLocaleDateString('en-US', deliveryOptions);

    // Render receipt details securely
    document.getElementById('receipt-order-no').textContent = `#${orderNo}`;
    document.getElementById('receipt-delivery-date').textContent = formattedDate;
    document.getElementById('receipt-email').textContent = email;

    // Reset checkout form fields
    document.getElementById('shipping-form').reset();
    document.getElementById('payment-form').reset();

    // Reset virtual card DOM to default placeholders
    document.getElementById('v-card-number').textContent = '•••• •••• •••• ••••';
    document.getElementById('v-card-name').textContent = 'YOUR NAME';
    document.getElementById('v-card-expiry').textContent = 'MM/YY';
    document.getElementById('v-card-cvv').textContent = '•••';
    document.getElementById('v-card-logo').textContent = 'VISA';

    // Clear cart state
    state.cart = [];
    state.promoApplied = false;
    state.promoCode = '';
    state.discountPercentage = 0;

    // Reset inputs
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-msg').classList.add('hidden');

    saveSession();
    updateBadges();
    renderCartItems();

    setCheckoutStep(3);
  }

  // Secure validation message alternative to alert()
  function alertSecure(message) {
    // Creating a premium, non-blocking toast warning that does not freeze thread
    const toast = el('div', {
      class: 'toast-warning',
      style: 'position: fixed; bottom: 30px; right: 30px; background-color: #ef4444; color: white; padding: 16px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 10000; font-size: 0.9rem;'
    }, [message]);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // Generate falling diamond particles inside header and hero banner securely (no innerHTML)
  function initFallingDiamonds() {
    const headerContainer = document.getElementById('header-diamonds');
    if (headerContainer) {
      for (let i = 0; i < 20; i++) {
        createDiamond(headerContainer, 'diamond-particle', 5, 3, 4, 6, 10);
      }
    }

    const heroContainer = document.getElementById('hero-diamonds');
    if (heroContainer) {
      for (let i = 0; i < 40; i++) {
        createDiamond(heroContainer, 'hero-diamond-particle', 8, 5, 8, 8, 14);
      }
    }
  }

  function createDiamond(container, className, maxDelay, minDuration, durationRange, minSize, sizeRange) {
    // Use ♦ symbol securely using TextNode
    const diamond = el('div', { class: className }, ['\u2666']);

    const startX = Math.random() * 100; // random percentage width
    const delay = Math.random() * maxDelay; // offset animation start
    const duration = minDuration + Math.random() * durationRange; // fall duration
    const size = minSize + Math.random() * sizeRange; // font size
    const opacity = 0.15 + Math.random() * 0.55; // transparency

    diamond.style.left = `${startX}%`;
    diamond.style.animationDelay = `${delay}s`;
    diamond.style.animationDuration = `${duration}s`;
    diamond.style.fontSize = `${size}px`;
    diamond.style.opacity = opacity.toString();

    container.appendChild(diamond);
  }

})();
