// main.js (FULL — merged + auto-generate 220 products)
// -----------------------------
// Splash 2.5s, Menu toggle, Back, Firebase, Auth, Cart, Products (220), Render, Product details, Checkout placeholders
// -----------------------------

// --- Splash screen 2.5s ---
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const main = document.getElementById("main") || document.body;
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
      // if you have a #main container, show it
      if (document.getElementById("main")) document.getElementById("main").style.display = "block";
    }, 2500);
  }
});

// --- Menu toggle (hamburger) ---
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) menu.classList.toggle("open");
}

// --- Back button ---
function goBack() {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/";
}

// ---------- FIREBASE CONFIG & INIT ----------
/*
 * Replace firebaseConfig below if you want a different Firebase project.
 * The user-provided values were used here.
 */
const firebaseConfig = {
  apiKey: "AIzaSyA2lx1hb2qZsYaXrQhsUp7hepYu5nY3fgs",
  authDomain: "damitools.firebaseapp.com",
  projectId: "damitools",
  storageBucket: "damitools.firebasestorage.app",
  messagingSenderId: "875796385681",
  appId: "1:875796385681:android:563ffc58665bdc94875430"
};

// Load firebase only if firebase object exists (web SDK script should be included in index.html)
let firebaseEnabled = false;
try {
  if (typeof firebase !== "undefined" && firebase && firebase.initializeApp) {
    try {
      firebase.initializeApp(firebaseConfig);
      firebaseEnabled = true;
    } catch (e) {
      // if already initialized, skip
      try {
        firebase.app();
        firebaseEnabled = true;
      } catch (err) {
        console.warn("Firebase init warning:", err);
      }
    }
  } else {
    console.warn("Firebase SDK not detected. Firebase features will be disabled.");
  }
} catch (e) {
  console.warn("Firebase initialization error:", e);
}

let auth = null;
let db = null;
if (firebaseEnabled) {
  auth = firebase.auth();
  db = firebase.firestore();
  // Keep auth state
  auth.onAuthStateChanged(user => {
    if (user) showProfile(user);
    else showGuestProfile();
  });
}

// ---------- AUTH HELPERS ----------
function loginUser(email, password) {
  if (!firebaseEnabled) return Promise.reject(new Error("Firebase not configured"));
  return auth.signInWithEmailAndPassword(email, password)
    .then(result => {
      showProfile(result.user);
      return result.user;
    });
}

function registerUser(name, email, password) {
  if (!firebaseEnabled) return Promise.reject(new Error("Firebase not configured"));
  return auth.createUserWithEmailAndPassword(email, password)
    .then(async res => {
      await res.user.updateProfile({ displayName: name });
      await db.collection("users").doc(res.user.uid).set({
        name,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showProfile(res.user);
      return res.user;
    });
}

function logoutUser() {
  if (!firebaseEnabled) {
    showGuestProfile();
    return Promise.resolve();
  }
  return auth.signOut().then(() => showGuestProfile());
}

function showProfile(user) {
  const profile = document.getElementById("userProfile");
  const menuAvatar = document.getElementById("menuAvatar");
  if (profile) {
    const name = user.displayName || user.email || "User";
    const photo = user.photoURL || "assets/icons/profile.png";
    profile.innerHTML = `<img src="${photo}" class="profile-pic" style="width:44px;height:44px;border-radius:50%;object-fit:cover;margin-right:8px"> <span>${escapeHtml(name)}</span>`;
  }
  if (menuAvatar) {
    menuAvatar.innerHTML = `<img src="${user.photoURL || 'assets/icons/profile.png'}" class="profile-pic" style="width:64px;height:64px;border-radius:50%;object-fit:cover"> <div style="margin-top:6px">${escapeHtml(user.displayName || user.email || "User")}</div>`;
  }
}

function showGuestProfile() {
  const profile = document.getElementById("userProfile");
  const menuAvatar = document.getElementById("menuAvatar");
  if (profile) profile.innerHTML = `Guest`;
  if (menuAvatar) menuAvatar.innerHTML = `<div style="font-weight:700">Welcome</div><div class="muted-small">Sign in for full features</div>`;
}

// ---------- CART ----------
let cart = JSON.parse(localStorage.getItem("damitools_cart") || "[]");

function saveCart() {
  localStorage.setItem("damitools_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id, name, price, img, qty = 1) {
  const existing = cart.find(it => it.id === id);
  if (existing) existing.qty = Math.min(999, existing.qty + qty);
  else cart.push({ id, name, price, img, qty });
  saveCart();
  toast(`${name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(it => it.id !== id);
  saveCart();
}

function incQty(id) {
  const it = cart.find(x => x.id === id);
  if (it) { it.qty++; saveCart(); }
}

function decQty(id) {
  const it = cart.find(x => x.id === id);
  if (it) { it.qty = Math.max(1, it.qty - 1); saveCart(); }
}

function clearCart() {
  cart = []; saveCart();
}

// ---------- SIMPLE UI HELPERS ----------
function $(id) { return document.getElementById(id); }

function toast(msg, ms = 1600) {
  // Simple in-page toast
  let t = document.createElement("div");
  t.innerText = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%)";
  t.style.bottom = "22px";
  t.style.background = "rgba(0,0,0,0.8)";
  t.style.color = "#fff";
  t.style.padding = "10px 14px";
  t.style.borderRadius = "8px";
  t.style.zIndex = 99999;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// Escape HTML
function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}

// ---------- PRODUCT GENERATION (220+) ----------
// We programmatically generate many products from the categories + variants you listed.
// Images use Unsplash source endpoint to fetch representative images by keyword.
const baseCatalog = [
  { key: "pop light 18w", baseName: "18W POP Light", cat: "Lighting", price: 2500 },
  { key: "pop light 12w", baseName: "12W POP Light", cat: "Lighting", price: 1800 },
  { key: "pop light 6w", baseName: "6W POP Light", cat: "Lighting", price: 1200 },
  { key: "pop light 30w", baseName: "30W POP Light", cat: "Lighting", price: 3200 },

  { key: "1 gang switch", baseName: "1-Gang Switch", cat: "Switches & Sockets", price: 800 },
  { key: "2 gang switch", baseName: "2-Gang Switch", cat: "Switches & Sockets", price: 1200 },
  { key: "3 gang switch", baseName: "3-Gang Switch", cat: "Switches & Sockets", price: 1500 },
  { key: "4 gang switch", baseName: "4-Gang Switch", cat: "Switches & Sockets", price: 2000 },

  { key: "13a single socket", baseName: "13A Single Socket", cat: "Switches & Sockets", price: 2200 },
  { key: "13a double socket", baseName: "13A Double Socket", cat: "Switches & Sockets", price: 3200 },
  { key: "15a socket", baseName: "15A Socket", cat: "Switches & Sockets", price: 3500 },

  { key: "knife switch", baseName: "Knife Switch", cat: "Tools", price: 1200 },
  { key: "fuse base", baseName: "Fuse & Base", cat: "Tools", price: 800 },
  { key: "circuit breaker", baseName: "Circuit Breaker", cat: "Tools", price: 5000 },
  { key: "dfb", baseName: "Distribution Fuse Board (DFB)", cat: "Tools", price: 22000 },

  { key: "1mm wire", baseName: "1mm Wire (roll)", cat: "Wires & Cables", price: 2000 },
  { key: "1.5mm wire", baseName: "1.5mm Wire (100m)", cat: "Wires & Cables", price: 45000 },
  { key: "2.5mm wire", baseName: "2.5mm Wire (100m)", cat: "Wires & Cables", price: 65000 },
  { key: "4mm wire", baseName: "4mm Wire (100m)", cat: "Wires & Cables", price: 90000 },

  { key: "chandelier", baseName: "Chandelier", cat: "Lighting", price: 32000 },
  { key: "garden light", baseName: "Garden Light 18W", cat: "Lighting", price: 5000 },
  { key: "led spotlight", baseName: "LED Spotlight", cat: "Lighting", price: 1200 },

  { key: "power bank", baseName: "Power Bank 20000mAh", cat: "Gadgets", price: 12000 },
  { key: "earphones", baseName: "Earphones", cat: "Gadgets", price: 1500 },
  { key: "bluetooth speaker", baseName: "Bluetooth Speaker", cat: "Gadgets", price: 7000 },
  { key: "generator", baseName: "Generator (small)", cat: "Gadgets", price: 120000 },

  /* Additional groups derived from the long product list you provided */
  { key: "bulk head light", baseName: "Bulk Head Light 18W", cat: "Lighting", price: 1800 },
  { key: "rope light", baseName: "Rope Light (single)", cat: "Accessories", price: 3500 },
  { key: "rope light multi", baseName: "Rope Light (multi color)", cat: "Accessories", price: 4200 },
  { key: "led strip", baseName: "LED Strip Light", cat: "Accessories", price: 2500 },

  { key: "step sensor panel", baseName: "Step Sensor Panel", cat: "Electronics", price: 6000 },
  { key: "power supply 60w", baseName: "60W Power Supply", cat: "Electronics", price: 4000 },
  { key: "power supply 100w", baseName: "100W Power Supply", cat: "Electronics", price: 6000 },

  { key: "inverter", baseName: "Power Inverter", cat: "Gadgets", price: 45000 },
  { key: "adapter", baseName: "Cable & Adapter", cat: "Gadgets", price: 1200 },

  { key: "fan standing", baseName: "Standing Fan", cat: "Fans", price: 22000 },
  { key: "ceiling fan", baseName: "Ceiling Fan", cat: "Fans", price: 25000 },
  { key: "portable fan", baseName: "Portable Fan", cat: "Fans", price: 4500 },

  { key: "phone android", baseName: "Android Phone (generic)", cat: "Phones", price: 45000 },
  { key: "iphone", baseName: "iPhone (generic)", cat: "Phones", price: 180000 },
  { key: "ipad", baseName: "iPad (generic)", cat: "Tablets", price: 220000 }
];

// generator function to add brand variants and sizes, producing many items
function generateProducts() {
  const products = [];
  let id = 1;
  const brands = ["Generic", "Proline", "ElectroMax", "SunBright", "Lumina", "PowerCore", "SafeLine", "Apex", "Nova", "GlobalTech"];
  const sizeVariants = ["Std", "Small", "Medium", "Large", "XL", "Pack of 2", "Pack of 5", "50m", "100m"];
  for (let base of baseCatalog) {
    // create a main product
    const p = {
      id: id++,
      name: `${base.baseName} (${brands[(id + 3) % brands.length]})`,
      price: base.price,
      cat: base.cat,
      img: `https://source.unsplash.com/800x600/?${encodeURIComponent(base.key)}`
    };
    products.push(p);

    // add brand variations
    for (let b = 0; b < brands.length; b++) {
      const brandItem = {
        id: id++,
        name: `${base.baseName} - ${brands[b]}`,
        price: Math.max(200, Math.round(base.price * (0.85 + Math.random() * 0.6))),
        cat: base.cat,
        img: `https://source.unsplash.com/800x600/?${encodeURIComponent(base.key + " " + brands[b])}`
      };
      products.push(brandItem);
      if (id > 220) break;
    }
    if (id > 220) break;

    // add size variants for wire, pipe, and some other categories
    if (base.cat.toLowerCase().includes("wire") || base.baseName.toLowerCase().includes("wire") || base.key.includes("wire") || base.baseName.toLowerCase().includes("pipe") ) {
      for (let sv of sizeVariants) {
        const svItem = {
          id: id++,
          name: `${base.baseName} - ${sv}`,
          price: Math.max(200, Math.round(base.price * (0.7 + Math.random() * 1.8))),
          cat: base.cat,
          img: `https://source.unsplash.com/800x600/?${encodeURIComponent(base.key + " " + sv)}`
        };
        products.push(svItem);
        if (id > 220) break;
      }
      if (id > 220) break;
    }

    // add a couple of similar accessories to expand catalog
    const extras = [
      { tag: "accessory", nameSuffix: "Accessory Kit" },
      { tag: "spare", nameSuffix: "Spare Part" }
    ];
    for (let ex of extras) {
      const item = {
        id: id++,
        name: `${base.baseName} - ${ex.nameSuffix}`,
        price: Math.max(150, Math.round(base.price * (0.4 + Math.random()))),
        cat: base.cat,
        img: `https://source.unsplash.com/800x600/?${encodeURIComponent(base.key + " " + ex.tag)}`
      };
      products.push(item);
      if (id > 220) break;
    }
    if (id > 220) break;
  }

  // If still below 220, add generic products derived from a list of your items
  const extraNames = [
    "Trunking Pipe 25mm", "Trunking Pipe 20mm", "3x3 PVC Box", "3x6 PVC Box", "4x4 PVC Box", "6x6 PVC Box",
    "6x9 PVC Box", "U Box", "Y Box", "T Box", "4-way Box", "Through Box", "PVC Gum", "Choke",
    "Garden Light 24W", "Dropping Light", "Lamp Holder", "Tower Clip", "Water Heater Switch 20A",
    "Water Heater Switch 45A", "Trunking", "LED Half Moon Light", "Contactor & Relay", "Fishing Tape",
    "LED Strip Profile", "60W PSU", "200W PSU", "400W PSU", "Black Tape", "13A Plug", "15A Plug",
    "Home Theater System", "Receiver & Amplifier", "Soundbar", "PlayStation 4", "PlayStation 3",
    "PlayStation 2", "PlayStation Vita", "Bluetooth Earphones", "Power Inverter", "Android Phone", "iPhone"
  ];
  let i = 0;
  while (id <= 220 && i < extraNames.length * 6) {
    const name = extraNames[i % extraNames.length] + (i % 6 ? ` - ${["Std","Pro","Lite","Max","Deluxe","Basic"][i%6]}` : "");
    const product = {
      id: id++,
      name: name,
      price: Math.max(500, Math.round(1000 + Math.random() * 50000)),
      cat: "Misc",
      img: `https://source.unsplash.com/800x600/?${encodeURIComponent(name)}`
    };
    products.push(product);
    i++;
  }

  return products;
}

const PRODUCTS = generateProducts(); // 220 items approx

// ---------- RENDER PRODUCTS ----------
const productGridId = "productGrid";

function createProductCardHTML(p) {
  // returns HTML string for one product card
  return `
    <div class="card product-card" data-id="${p.id}" data-category="${escapeHtml(p.cat)}" style="min-height:320px">
      <div style="height:210px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#0b0f12">
        <img src="${p.img}" alt="${escapeHtml(p.name)}" style="width:100%;height:210px;object-fit:cover;display:block"/>
      </div>
      <div class="info">
        <div><div class="title">${escapeHtml(p.name)}</div><div class="muted">${escapeHtml(p.cat)}</div></div>
        <div style="margin-top:auto;display:flex;gap:8px;align-items:center">
          <div style="flex:1"><div class="price">₦${Number(p.price).toLocaleString()}</div></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn" onclick="addToCart(${p.id}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.img)})">Add to Cart</button>
            <button class="btn-outline" onclick="openProductDetails(${p.id})">Details</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(list = PRODUCTS) {
  const grid = document.getElementById(productGridId);
  if (!grid) return;
  // grid uses 2-columns on mobile for your app, but our CSS handles responsiveness — this just injects cards
  grid.innerHTML = list.map(p => createProductCardHTML(p)).join("");
  renderCart(); // update cart UI
}

// ---------- PRODUCT RECOMMENDATION ----------
function getRecommendations(product, count = 4) {
  if (!product) return [];
  const sameCat = PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id);
  // random shuffle
  for (let i = sameCat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sameCat[i], sameCat[j]] = [sameCat[j], sameCat[i]];
  }
  return sameCat.slice(0, count);
}

function renderRecommendations(product) {
  const recs = getRecommendations(product);
  if (!recs.length) return "";
  return `
    <h4 style="margin-top:16px">You may also like</h4>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${recs.map(r => `
        <div class="card" style="width:140px" onclick="openProductDetails(${r.id})">
          <img src="${r.img}" style="width:100%;height:100px;object-fit:cover;border-radius:6px">
          <div class="muted-small">${escapeHtml(r.name)}</div>
          <div class="price">₦${Number(r.price).toLocaleString()}</div>
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- PRODUCT DETAILS PAGE (modal or new page) ----------
const detailModalId = "detailModal";
function openProductDetails(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  // If product page exists (product.html) store it and navigate; else open modal
  if (window.location.pathname.endsWith("/product.html") || window.location.pathname.endsWith("product.html")) {
    localStorage.setItem("product", JSON.stringify(p));
    // reload details
    loadProductDetails();
    return;
  }
  // modal content injection
  const modal = document.getElementById(detailModalId);
  if (!modal) {
    // fallback open in new page using storage
    localStorage.setItem("product", JSON.stringify(p));
    window.location.href = "product.html";
    return;
  }
  modal.style.display = "grid";
  const content = modal.querySelector(".box #detailContent") || modal.querySelector("#detailContent");
  if (!content) {
    console.warn("No detailContent element in modal");
    return;
  }
  // produce 3 images (Unsplash variations)
  const imgs = [
    p.img,
    p.img + "&sig=1",
    p.img + "&sig=2"
  ];
  content.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="width:260px">
        <img src="${imgs[0]}" style="width:100%;height:260px;object-fit:cover;border-radius:8px;margin-bottom:8px">
        <div style="display:flex;gap:8px">
          <img src="${imgs[1]}" style="width:124px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="document.querySelector('#detailContent img').src='${imgs[1]}'">
          <img src="${imgs[2]}" style="width:124px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="document.querySelector('#detailContent img').src='${imgs[2]}'">
        </div>
      </div>
      <div style="flex:1">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="muted-small">${escapeHtml(p.cat)}</div>
        <div class="price">₦${Number(p.price).toLocaleString()}</div>
        <p class="muted-small">High-quality ${escapeHtml(p.name)}. For bulk orders, contact customer care.</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input id="qtyInput" type="number" value="1" min="1" style="width:86px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:inherit">
          <button class="btn" onclick="(function(){ const q = parseInt(document.getElementById('qtyInput').value||1); addToCart(${p.id}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.img)}, q); closeDetailModal(); })()">Add to Cart</button>
          <button class="btn-outline" onclick="openAppOrApk(${p.id})">Open in App / APK</button>
        </div>
      </div>
    </div>
  `;
  // place the main image tag first for the onclick above to work
  // ensure the first <img> inside detailContent has no id conflict
  const firstImg = content.querySelector("img");
  if (firstImg) firstImg.id = "detailMainImg";
}

function closeDetailModal() {
  const modal = document.getElementById(detailModalId);
  if (modal) modal.style.display = "none";
}

// Load product details on product.html (if exists)
function loadProductDetails() {
  const product = JSON.parse(localStorage.getItem("product") || "{}");
  if (!product || !product.id) return;
  const nameEl = document.getElementById("productName");
  const priceEl = document.getElementById("productPrice");
  const imgEl = document.getElementById("productImg");
  const descEl = document.getElementById("productDesc");
  if (nameEl) nameEl.innerText = product.name;
  if (priceEl) priceEl.innerText = "₦" + Number(product.price).toLocaleString();
  if (imgEl) imgEl.src = product.img;
  if (descEl) descEl.innerText = product.description || ("High quality " + product.name);
}

// ---------- OPEN APP / APK ----------
const APK_LINK = "https://expo.dev/accounts/oluwadamilaremose/projects/DamiTools/builds/dae29279-7512-4ffc-b646-686c42152592"; // expo build link (replace with GitHub release if you host on GitHub)
function openAppOrApk(productId) {
  // try intent (android). This will open the app if installed; otherwise fallback to APK_LINK
  try {
    const intent = `intent://product/${productId}#Intent;scheme=damitools;package=com.oluwadamilaremose.DamiTools;end`;
    window.location.href = intent;
    setTimeout(() => {
      window.open(APK_LINK, "_blank");
    }, 900);
  } catch (e) {
    window.open(APK_LINK, "_blank");
  }
}

// ---------- CHECKOUT & ORDERS (Firebase optional) ----------
async function placeOrderCOD(customer) {
  // customer: {name, phone, address}
  if (!cart.length) return toast("Cart is empty");
  const order = {
    id: Date.now(),
    items: cart.map(it => ({ id: it.id, name: it.name, price: it.price, qty: it.qty })),
    total: cart.reduce((s, it) => s + it.price * it.qty, 0),
    customer,
    method: "COD",
    createdAt: new Date().toISOString()
  };
  // Save locally
  const ordersLocal = JSON.parse(localStorage.getItem("damitools_orders") || "[]");
  ordersLocal.push(order);
  localStorage.setItem("damitools_orders", JSON.stringify(ordersLocal));
  // Try Firebase
  if (firebaseEnabled) {
    try {
      await db.collection("orders").add({
        customer: order.customer,
        items: order.items,
        total: order.total,
        method: order.method,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast("Order placed and saved to cloud");
    } catch (err) {
      console.error("Firestore save failed:", err);
      toast("Order placed locally (cloud save failed)");
    }
  } else {
    toast("Order placed locally");
  }
  // clear cart
  clearCart();
}

async function placeOrderOnline(customer, paymentInfo) {
  // paymentInfo is placeholder — integrate Paystack/Flutterwave server-side or via SDK
  toast("Online payments not yet integrated. Use COD for now.");
}

// ---------- CART RENDER ----------
function renderCart() {
  const cartList = document.getElementById("cartList");
  const cartCount = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("subtotal");
  if (cartCount) cartCount.textContent = cart.reduce((a, c) => a + c.qty, 0);
  if (cartList) {
    cartList.innerHTML = cart.length ? cart.map(c => `
      <div class="cart-item">
        <img src="${c.img}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;margin-right:10px">
        <div style="flex:1">
          <div style="font-weight:700">${escapeHtml(c.name)}</div>
          <div class="muted-small">${escapeHtml(c.cat || "")}</div>
          <div class="muted-small">₦${Number(c.price * c.qty).toLocaleString()} (${c.qty} × ₦${Number(c.price).toLocaleString()})</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <button class="qty-btn" onclick="incQty(${c.id})">+</button>
          <button class="qty-btn" onclick="decQty(${c.id})">−</button>
          <button class="btn" style="background:#ef4444" onclick="removeFromCart(${c.id})">Remove</button>
        </div>
      </div>
    `).join('') : '<div class="muted-small">Cart is empty</div>';
  }
  if (subtotalEl) subtotalEl.textContent = '₦' + cart.reduce((a, c) => a + c.price * c.qty, 0).toLocaleString();
}

// ---------- SEARCH & FILTER ----------
function filterProductsByQuery(q) {
  q = (q || "").trim().toLowerCase();
  if (!q) return renderProducts();
  const filtered = PRODUCTS.filter(p => (p.name + " " + (p.cat || "")).toLowerCase().includes(q));
  renderProducts(filtered);
}

function filterByCategory(cat) {
  if (!cat || cat === "all") return renderProducts();
  const filtered = PRODUCTS.filter(p => (p.cat || "").toLowerCase() === cat.toLowerCase());
  renderProducts(filtered);
}

// ---------- CONTACT LINKS ----------
function openWhatsApp() {
  // the WhatsApp number you gave earlier
  const WHATSAPP = "2347054700008";
  window.open(`https://wa.me/${WHATSAPP}`, "_blank");
}

function openEmail() {
  window.location.href = "mailto:oluwadamilaremoses14@gmail.com";
}

// ---------- UTIL: Build categories list from PRODUCTS ----------
function getCategories() {
  const cats = {};
  for (const p of PRODUCTS) {
    const c = p.cat || "Other";
    cats[c] = (cats[c] || 0) + 1;
  }
  return Object.keys(cats).sort();
}

// ---------- INIT UI BINDINGS ----------
function initUIBindings() {
  // search box
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", e => filterProductsByQuery(e.target.value));
  }
  // nav buttons
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.addEventListener("click", () => { document.getElementById("productArea").style.display = "block"; document.getElementById("checkoutArea").style.display = "none"; renderProducts(); });

  const catBtn = document.getElementById("catBtn");
  if (catBtn) catBtn.addEventListener("click", () => {
    // show category list modal or just alert for now; we will render the categories
    const cats = getCategories();
    const list = cats.map(c => `<button class="btn-outline" style="margin:6px" onclick="filterByCategory('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('');
    // simple modal
    const content = document.getElementById("detailContent");
    if (content) {
      content.innerHTML = `<div><h3>Categories</h3><div style="display:flex;flex-wrap:wrap">${list}</div></div>`;
      const modal = document.getElementById("detailModal");
      if (modal) modal.style.display = "grid";
    } else {
      alert("Categories: " + cats.join(", "));
    }
  });

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", () => {
    document.getElementById("productArea").style.display = "none";
    document.getElementById("checkoutArea").style.display = "block";
    renderCart();
  });

  const accountBtn = document.getElementById("accountBtn");
  if (accountBtn) accountBtn.addEventListener("click", openAccountModal);

  // Chat fab
  const chatFab = document.getElementById("chatFab");
  if (chatFab) chatFab.addEventListener("click", () => window.open("https://wa.me/2347054700008", "_blank"));

  const apkBtn = document.getElementById("apkBtn");
  if (apkBtn) apkBtn.addEventListener("click", () => window.open(APK_LINK, "_blank"));

  // close detail modal
  const closeDetailEl = document.getElementById("closeDetail");
  if (closeDetailEl) closeDetailEl.addEventListener("click", closeDetailModal);

  const closeAccount = document.getElementById("closeAccount");
  if (closeAccount) closeAccount.addEventListener("click", () => {
    const acc = document.getElementById("accountModal");
    if (acc) acc.style.display = "none";
  });

  // confirm order button
  const confirmBtn = document.getElementById("confirmOrderBtn");
  if (confirmBtn) confirmBtn.addEventListener("click", () => {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    if (!name || !phone || !address) return alert("Please fill name, phone and address.");
    placeOrderCOD({ name, phone, address });
  });

  // whatsapp order
  const whatsappOrderBtn = document.getElementById("whatsappOrderBtn");
  if (whatsappOrderBtn) whatsappOrderBtn.addEventListener("click", () => {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    if (!name || !phone || !address) return alert("Please fill name, phone and address.");
    let msg = `Hello DamiTools,%0AI want to place an order.%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AAddress: ${encodeURIComponent(address)}%0AItems:%0A`;
    cart.forEach(it => {
      msg += `- ${encodeURIComponent(it.name)} x${it.qty} = ₦${Number(it.price * it.qty).toLocaleString()}%0A`;
    });
    const total = cart.reduce((a, c) => a + c.qty * c.price, 0);
    msg += `%0ATotal: ₦${total.toLocaleString()}%0A%0APayment: Pay on Delivery`;
    window.open(`https://wa.me/2347054700008?text=${msg}`, "_blank");
  });

  // email order
  const emailOrderBtn = document.getElementById("emailOrderBtn");
  if (emailOrderBtn) emailOrderBtn.addEventListener("click", () => {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    if (!name || !phone || !address) return alert("Please fill name, phone and address.");
    let body = `Hello DamiTools,\n\nI want to place an order.\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n`;
    cart.forEach(it => {
      body += `- ${it.name} x${it.qty} = ₦${Number(it.price * it.qty).toLocaleString()}\n`;
    });
    const total = cart.reduce((a, c) => a + c.qty * c.price, 0);
    body += `\nTotal: ₦${total.toLocaleString()}\n\nPayment: Pay on Delivery\n\nThanks.`;
    window.location.href = `mailto:oluwadamilaremoses14@gmail.com?subject=${encodeURIComponent("New Order from " + name)}&body=${encodeURIComponent(body)}`;
  });

  // hide open-app button if no APK_LINK
  if (!APK_LINK || APK_LINK.includes("example.com")) {
    const apk = document.getElementById("apkBtn");
    if (apk) apk.style.display = "none";
  }
}

// ---------- ACCOUNT MODAL ----------
function openAccountModal() {
  const accountArea = document.getElementById("accountArea");
  if (!accountArea) return;
  const user = (firebaseEnabled && auth && auth.currentUser) ? auth.currentUser : null;
  if (user) {
    accountArea.innerHTML = `
      <div>
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${user.photoURL || 'assets/icons/profile.png'}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">
          <div>
            <div style="font-weight:800">${escapeHtml(user.displayName || user.email)}</div>
            <div class="muted-small">${escapeHtml(user.email)}</div>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button id="btnLogout" class="btn" style="background:#ef4444">Logout</button>
        </div>
      </div>
    `;
    document.getElementById("btnLogout").onclick = async () => {
      await logoutUser();
      alert("Logged out");
      document.getElementById("accountModal").style.display = "none";
    };
  } else {
    accountArea.innerHTML = `
      <div>
        <h3>Login / Sign up</h3>
        <input id="acctName" class="input" placeholder="Full name (for signup)" />
        <input id="acctEmail" class="input" placeholder="Email" />
        <input id="acctPass" type="password" class="input" placeholder="Password" />
        <div style="display:flex;gap:8px">
          <button id="btnLogin" class="btn">Login</button>
          <button id="btnSignup" class="btn-outline">Sign up</button>
        </div>
        <div class="muted-small" style="margin-top:8px">Local accounts are demo only. Use Firebase for real accounts.</div>
      </div>
    `;
    document.getElementById("btnLogin").onclick = async () => {
      const email = document.getElementById("acctEmail").value.trim();
      const pass = document.getElementById("acctPass").value.trim();
      if (!email || !pass) return alert("Enter email & password");
      if (!firebaseEnabled) {
        // local demo
        const s = JSON.parse(localStorage.getItem("damitools_local_account") || "{}");
        if (s.email === email && s.pass === pass) {
          alert("Local login success");
          document.getElementById("accountModal").style.display = "none";
        } else {
          alert("Local login failed (no such user). Use signup.");
        }
        return;
      }
      try {
        await loginUser(email, pass);
        alert("Login successful");
        document.getElementById("accountModal").style.display = "none";
      } catch (err) {
        alert("Login failed: " + (err.message || err));
      }
    };
    document.getElementById("btnSignup").onclick = async () => {
      const name = document.getElementById("acctName").value.trim();
      const email = document.getElementById("acctEmail").value.trim();
      const pass = document.getElementById("acctPass").value.trim();
      if (!name || !email || !pass) return alert("Enter name, email & password");
      if (!firebaseEnabled) {
        localStorage.setItem("damitools_local_account", JSON.stringify({ name, email, pass }));
        alert("Local account created");
        document.getElementById("accountModal").style.display = "none";
        return;
      }
      try {
        await registerUser(name, email, pass);
        alert("Account created");
        document.getElementById("accountModal").style.display = "none";
      } catch (err) {
        alert("Signup failed: " + (err.message || err));
      }
    };
  }
  document.getElementById("accountModal").style.display = "grid";
}

// ---------- BOOTSTRAP ----------
function initApp() {
  renderProducts();
  renderCart();
  initUIBindings();
  // hide splash handled earlier
}

// Kick off
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
