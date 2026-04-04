/* ═══════════════════════════════════════════════════════
   NOURISH — script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── CONSTANTS ──────────────────────────────────────────── */
const ORDER_KEY = 'nourish_order_v1';
const CART_KEY = 'nourish_cart_v2';


const ITEM_DATA = {
  'med-bowl':       { id:'med-bowl',       name:'Classic Mediterranean Bowl', desc:'Kale, Chickpeas, Quinoa & Hummus',            price:129, img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
  'home-curry':     { id:'home-curry',     name:'Home Style Curry',            desc:'Creamy dal, rice & pickle',                  price:189, img:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  'paneer-tiffin':  { id:'paneer-tiffin',  name:'Paneer Special Tiffin',       desc:'Butter paneer, 3 rotis, dal & rice',         price:210, img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
  'garden-tiffin':  { id:'garden-tiffin',  name:'Garden Green Tiffin',         desc:'Sprouts, steamed veggies, multi-grain roti', price:140, img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
  'mysore-combo':   { id:'mysore-combo',   name:'Mysore Masala Combo',         desc:'2 Crispy Dosas with sambar & chutneys',      price:120, img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
  'maharaja-thali': { id:'maharaja-thali', name:'Royal Maharaja Thali',        desc:'Paneer masala, Dal makhani, 3 Rotis, Rice',  price:240, img:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  'exec-meal':      { id:'exec-meal',      name:'Executive Mini Meal',         desc:'Veg curry, Dal tadka, 2 Phulkas & Rice',     price:160, img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
  'chicken-thali':  { id:'chicken-thali',  name:'Chicken Thali Special',       desc:'Chicken curry, 3 Rotis, Dal, Rice & Raita',  price:220, img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
  'quinoa-bowl':    { id:'quinoa-bowl',    name:'Artisan Quinoa Bowl',         desc:'Extra Avocado, Roasted chickpeas, Tahini',   price:175, img:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
  'poha-breakfast': { id:'poha-breakfast', name:'Kanda Poha & Chai',           desc:'Flattened rice with onion, peanuts & chai',  price:80,  img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
};

/* ── CART STORAGE ───────────────────────────────────────── */
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  save(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },
  add(id) {
    const cart = this.get();
    const item = cart.find(c => c.id === id);
    if (item) { item.qty++; }
    else {
      const data = ITEM_DATA[id];
      if (!data) return;
      cart.push({ ...data, qty: 1 });
    }
    this.save(cart);
    UI.refreshCart();
    const name = ITEM_DATA[id]?.name || 'Item';
    toast(`"${name}" added to cart`);
  },
  remove(id) {
    this.save(this.get().filter(c => c.id !== id));
    UI.refreshCart();
  },
  updateQty(id, delta) {
    const cart = this.get();
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { this.remove(id); return; }
    this.save(cart);
    UI.refreshCart();
  },
  count() { return this.get().reduce((s, c) => s + c.qty, 0); },
  subtotal() { return this.get().reduce((s, c) => s + c.price * c.qty, 0); },
};

/* ── TOAST ──────────────────────────────────────────────── */
function toast(msg, duration = 2400) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── NAVIGATION ─────────────────────────────────────────── */
const Nav = {
  current: 'home',

  go(section) {
    if (!section) return;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    // Show target page
    const target = document.getElementById(`page-${section}`);
    if (!target) return;
    target.style.display = 'block';
    target.classList.add('active');

    // Update nav link highlights
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.section === section);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile nav if open
    document.getElementById('mobileNav')?.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('open');

    this.current = section;

    // Section-specific setup
    if (section === 'cart') UI.renderCart();
  },
};

/* ── UI UPDATES ─────────────────────────────────────────── */
const UI = {
  refreshCart() {
    const count = Cart.count();
    // Badge
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Re-render if cart page is visible
    if (Nav.current === 'cart') this.renderCart();
  },

  renderCart() {
    const cart = Cart.get();
    const list = document.getElementById('cartList');
    const empty = document.getElementById('emptyCart');
    const summaryCol = document.getElementById('cartSummaryCol');

    if (!list || !empty) return;

    if (cart.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      if (summaryCol) summaryCol.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    if (summaryCol) summaryCol.style.display = 'block';

    list.innerHTML = cart.map(item => `
      <div class="cart-item-card" data-id="${item.id}">
        <img class="ci-img" src="${item.img}" alt="${item.name}" onerror="this.style.background='#eee'"/>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-desc">${item.desc}</div>
          <div class="ci-qty-row">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="ci-remove-btn" data-remove="${item.id}">
              <i class="fa-regular fa-trash-can"></i> Remove
            </button>
          </div>
        </div>
        <div class="ci-price">₹${(item.price * item.qty).toFixed(0)}</div>
      </div>
    `).join('');

    // Bind cart item buttons
    list.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        Cart.updateQty(btn.dataset.id, delta);
      });
    });
    list.querySelectorAll('.ci-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => Cart.remove(btn.dataset.remove));
    });

    this.updateSummary();
  },

  updateSummary() {
    const subtotal  = Cart.subtotal();
    const delivery  = subtotal > 0 ? 40 : 0;
    const tax       = Math.round(subtotal * 0.05);
    const total     = subtotal + delivery + tax;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('sumSubtotal', `₹${subtotal}`);
    set('sumDelivery',  subtotal > 0 ? `₹${delivery}` : '—');
    set('sumTax',       `₹${tax}`);
    set('sumTotal',     `₹${total}`);
  },
};

/* ── ADD BUTTONS ────────────────────────────────────────── */
function bindAddButtons(root = document) {
  root.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;
      Cart.add(id);
      // Visual feedback
      const orig = btn.textContent;
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('added');
        btn.disabled = false;
      }, 1000);
    });
  });
}

/* ── NAVBAR SCROLL EFFECT ───────────────────────────────── */
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── HAMBURGER ──────────────────────────────────────────── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
  });
}

/* ── GLOBAL DATA-SECTION NAVIGATION ────────────────────── */
function initSectionLinks() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-section]');
    if (!el) return;
    // Skip if it's an add-btn (handled elsewhere)
    if (el.classList.contains('add-btn')) return;
    const section = el.dataset.section;
    if (section) Nav.go(section);
  });
}

/* ── MENU FILTER ────────────────────────────────────────── */
function initMenuFilter() {
  const filterBar = document.querySelector('#page-menu .filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.fc-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.fc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const grid   = document.getElementById('menuGrid');
    const cards  = grid ? grid.querySelectorAll('.food-card') : [];
    const noRes  = document.getElementById('noResults');
    let visible  = 0;

    cards.forEach(card => {
      const cats = (card.dataset.category || '').split(' ');
      const show = filter === 'all' || cats.includes(filter);
      card.style.display = show ? 'block' : 'none';
      if (show) visible++;
    });

    if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
  });
}

/* ── CATEGORY CARDS on HOME → navigate to menu + set filter ── */
function initCategoryCards() {
  document.querySelectorAll('#page-home .cat-card[data-filter]').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      Nav.go('menu');
      // Apply filter after navigation
      setTimeout(() => {
        const btn = document.querySelector(`#page-menu .fc-btn[data-filter="${filter}"]`);
        if (btn) btn.click();
      }, 50);
    });
  });
}

/* ── PLAN TOGGLE ────────────────────────────────────────── */
function initPlanToggle() {
  const bar = document.querySelector('#page-subscription .plan-toggle-bar');
  if (!bar) return;

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.ptog');
    if (!btn) return;
    bar.querySelectorAll('.ptog').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const period = btn.dataset.period;
    const label  = period === 'weekly' ? '/week' : '/month';

    document.querySelectorAll('#page-subscription .plan-price').forEach(el => {
      el.textContent = el.dataset[period] || el.textContent;
    });
    document.querySelectorAll('#page-subscription .plan-per').forEach(el => {
      el.textContent = label;
    });
  });
}

/* ── PLAN SELECTION ─────────────────────────────────────── */
function initPlanSelection() {
  document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      // Reset all
      document.querySelectorAll('.plan-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      toast(`✓ ${plan} plan selected! Redirecting to checkout…`);
    });
  });
}

/* ── CHECKOUT ───────────────────────────────────────────── */
function  initCheckout() {
  const btn = document.getElementById('checkoutBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (Cart.count() === 0) {
      toast('Your cart is empty!');
      return;
    }

    btn.textContent = '⏳ Placing order…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Order Placed!';
      btn.style.background = '#059669';
      toast('🎉 Order placed! You can now track it live.');

      // ✅ CREATE ORDER
      const cart = Cart.get();
      const order = {
        items: cart,
        step: 0
      };

      localStorage.setItem(ORDER_KEY, JSON.stringify(order));

      // ✅ CLEAR CART
      localStorage.removeItem(CART_KEY);
      UI.refreshCart();

      // ✅ RESET TRACKING
      trackingStep = 0;

      setTimeout(() => {
        Nav.go('tracking');
        applyTrackingStep(trackingStep);

        // reset button
        btn.textContent = 'Proceed to Checkout →';
        btn.style.background = '';
        btn.disabled = false;

      }, 1200);

    }, 1600);
  });
}// {
//   const btn = document.getElementById('checkoutBtn');
//   if (!btn) return;
//   btn.addEventListener('click', () => {
//     if (Cart.count() === 0) { toast('Your cart is empty!'); return; }
//     btn.textContent = '⏳ Placing order…';
//     btn.disabled = true;
//     setTimeout(() => {
//       btn.textContent = '✓ Order Placed!';
//       btn.style.background = '#059669';
//       toast('🎉 Order placed! You can now track it live.');
//       setTimeout(() => {
//         Nav.go('tracking');
//         btn.textContent = 'Proceed to Checkout →';
//         btn.style.background = '';
//         btn.disabled = false;
//       }, 1200);
//     }, 1600);
//   });
// }

/* ── UPSELL CHIPS ───────────────────────────────────────── */
function initUpsellChips() {
  document.querySelectorAll('.upsell-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('upsell-on');
      const name = chip.textContent.trim().split('+')[0].split('₹')[0].trim();
      const on   = chip.classList.contains('upsell-on');
      toast(on ? `${name} added to your order` : `${name} removed`);
    });
  });
}

/* ── KITCHEN CARDS (home) ───────────────────────────────── */
function initKitchenCards() {
  document.querySelectorAll('#page-home .kitchen-card').forEach(card => {
    card.addEventListener('click', () => Nav.go('menu'));
  });
}

/* ── ORDER TRACKING ─────────────────────────────────────── */
let trackingStep = 0; // 0=received 1=preparing 2=on-the-way 3=delivered

const stepMessages = [
  'Order received — preparing your meal now.',
  'Meal is being prepared fresh!',
  'Courier is 1.2km away and heading to you.',
  '🎉 Delivered! Enjoy your meal.',
];
const etaTimes = ['12:25 PM', '12:35 PM', '12:45 PM', 'Delivered ✓'];
const etaDistances = [
  '<i class="fa-solid fa-bolt"></i> Order confirmed',
  '<i class="fa-solid fa-bolt"></i> Meal being prepared',
  '<i class="fa-solid fa-bolt"></i> Partner is 1.2km away',
  '<i class="fa-solid fa-check"></i> Delivered successfully',
];

function applyTrackingStep(step) {
  const steps = document.querySelectorAll('.dp-step');
  const lines  = [
    document.getElementById('dpLine0'),
    document.getElementById('dpLine1'),
    document.getElementById('dpLine2'),
  ];

  steps.forEach((s, i) => {
    s.classList.remove('done', 'active');
    if (i < step)       s.classList.add('done');
    else if (i === step) s.classList.add('active');
  });

  lines.forEach((line, i) => {
    if (!line) return;
    line.classList.toggle('done', i < step);
  });

  const etaEl   = document.getElementById('etaTime');
  const distEl  = document.getElementById('etaDist');
  if (etaEl)  etaEl.textContent  = etaTimes[step] || '';
  if (distEl) distEl.innerHTML   = etaDistances[step] || '';

  // Animate courier pin on map
  const pin = document.getElementById('courierPin');
  if (pin) {
    const positions = [
      { bottom: '62%', left: '12%' },
      { bottom: '52%', left: '22%' },
      { bottom: '38%', left: '40%' },
      { bottom: '25%', right: '24%', left: 'auto' },
    ];
    const pos = positions[step] || positions[2];
    Object.assign(pin.style, pos);
  }
}

function initTracking() {
  const simBtn = document.getElementById('simulateBtn');

  // ✅ LOAD ORDER FROM STORAGE
  const order = JSON.parse(localStorage.getItem(ORDER_KEY));

  if (order) {
    trackingStep = order.step || 0;
  } else {
    trackingStep = 0;
  }

  applyTrackingStep(trackingStep);

  if (!simBtn) return;

  simBtn.addEventListener('click', () => {
    if (trackingStep < 3) {
      trackingStep++;

      // ✅ SAVE PROGRESS
      const order = JSON.parse(localStorage.getItem(ORDER_KEY)) || {};
      order.step = trackingStep;
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));

      applyTrackingStep(trackingStep);
      toast(stepMessages[trackingStep]);

      if (trackingStep === 3) {
        simBtn.textContent = '✓ Order Delivered!';
        simBtn.disabled = true;
        simBtn.style.background = '#D1FAE5';
        simBtn.style.color = '#065F46';
        simBtn.style.borderColor = '#6EE7B7';
      }
    }
  });

  // Buttons
  document.getElementById('msgBtn')?.addEventListener('click', () => toast('Opening chat with Rahul…'));
  document.getElementById('callBtn')?.addEventListener('click', () => toast('Calling Rahul Sharma…'));
  document.getElementById('helpBtn')?.addEventListener('click', () => toast('Connecting to support chat…'));
}

  // Courier action buttons
//   document.getElementById('msgBtn')?.addEventListener('click', () => toast('Opening chat with Rahul…'));
//   document.getElementById('callBtn')?.addEventListener('click', () => toast('Calling Rahul Sharma…'));
//   document.getElementById('helpBtn')?.addEventListener('click', () => toast('Connecting to support chat…'));
// }

/* ── HERO BUTTONS ───────────────────────────────────────── */
function initHeroButtons() {
  document.querySelectorAll('.hero-btns button').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (section) Nav.go(section);
    });
  });
}

/* ── FOOTER LINKS ───────────────────────────────────────── */
function initFooterLinks() {
  document.querySelectorAll('.footer-col a[data-section]').forEach(a => {
    a.addEventListener('click', () => {
      const s = a.dataset.section;
      if (s) Nav.go(s);
    });
  });
}

/* ── BOOTSTRAP ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Show home by default
  Nav.go('home');

  // Init features
  initNavScroll();
  initHamburger();
  initSectionLinks();
  initHeroButtons();
  initCategoryCards();
  initKitchenCards();
  initMenuFilter();
  initPlanToggle();
  initPlanSelection();
  initCheckout();
  initUpsellChips();
  initTracking();
  initFooterLinks();
  bindAddButtons();

  // Initial cart badge sync
  UI.refreshCart();
});



