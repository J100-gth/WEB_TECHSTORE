const products = [
  {
    id: "rgb-pulse",
    name: "Audífonos RGB Pulse",
    price: 89.9,
    old: 119.9,
    cat: "audio",
    offer: true,
    img: "assets/headphones.png",
  },
  {
    id: "classic-sound",
    name: "Audífonos Classic Sound",
    price: 59.9,
    cat: "audio",
    img: "assets/headphones-classic.jpg",
  },
  {
    id: "earbuds-air",
    name: "Auriculares inalámbricos",
    price: 45,
    old: 62,
    cat: "audio",
    offer: true,
    img: "assets/earbuds.jpg",
  },
  {
    id: "mech-rgb",
    name: "Teclado mecánico RGB",
    price: 79.9,
    cat: "perifericos",
    img: "assets/keyboard.jpg",
  },
  {
    id: "mouse-pro",
    name: "Mouse gamer Pro",
    price: 29.9,
    old: 39.9,
    cat: "perifericos",
    offer: true,
    img: "assets/mouse.jpg",
  },
  {
    id: "boom-bt",
    name: "Parlante Bluetooth Boom",
    price: 39.9,
    cat: "smart",
    img: "assets/speaker.jpg",
  },
];

const money = (n) => `$${n.toFixed(2)}`;
const cartKey = "techstore-cart";
let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
let currentCat = "all";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

function cardHTML(p) {
  const old = p.old ? `<span class="old">${money(p.old)}</span>` : "";
  return `
    <article class="card">
      <img src="${p.img}" alt="${p.name}" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="price">${money(p.price)}${old}</p>
        <button class="btn-cta" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const list = products.filter((p) => currentCat === "all" || p.cat === currentCat);
  $("#product-grid").innerHTML = list.map(cardHTML).join("");
  $("#offers-grid").innerHTML = products.filter((p) => p.offer).map(cardHTML).join("");
}

function addToCart(id) {
  const item = products.find((p) => p.id === id);
  if (!item) return;
  const row = cart.find((c) => c.id === id);
  if (row) row.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  toast(`${item.name} se agregó al carrito`);
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = $("#cart-count");
  badge.hidden = count === 0;
  badge.style.display = count === 0 ? "none" : "grid";
  badge.textContent = String(count);

  const box = $("#cart-items");
  if (!cart.length) {
    box.innerHTML = `<p class="empty">Tu carrito está vacío.</p>`;
    $("#cart-total").textContent = money(0);
    return;
  }

  box.innerHTML = cart
    .map((row) => {
      const p = products.find((x) => x.id === row.id);
      return `
        <div class="cart-row">
          <img src="${p.img}" alt="" />
          <div>
            <strong>${p.name}</strong>
            <div class="qty">
              <button data-qty="${p.id}" data-d="-1">−</button>
              <span>${row.qty}</span>
              <button data-qty="${p.id}" data-d="1">+</button>
            </div>
          </div>
          <div>
            <p>${money(p.price * row.qty)}</p>
            <button data-remove="${p.id}">Quitar</button>
          </div>
        </div>
      `;
    })
    .join("");

  const total = cart.reduce((s, row) => {
    const p = products.find((x) => x.id === row.id);
    return s + p.price * row.qty;
  }, 0);
  $("#cart-total").textContent = money(total);
}

function changeQty(id, d) {
  const row = cart.find((c) => c.id === id);
  if (!row) return;
  row.qty += d;
  if (row.qty <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
}

function showView(name) {
  $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.page === name));
  $$(".nav a").forEach((a) => a.classList.toggle("is-active", a.dataset.view === name));
  $("#main-nav").classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildDots() {
  const grid = $(".dot-grid");
  grid.innerHTML = Array.from({ length: 20 }, () => "<span></span>").join("");
}

function init() {
  buildDots();
  renderProducts();
  renderCart();

  document.addEventListener("click", (e) => {
    const viewLink = e.target.closest("[data-view]");
    if (viewLink) {
      e.preventDefault();
      showView(viewLink.dataset.view);
    }

    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add);

    const qty = e.target.closest("[data-qty]");
    if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.d));

    const remove = e.target.closest("[data-remove]");
    if (remove) {
      cart = cart.filter((c) => c.id !== remove.dataset.remove);
      saveCart();
    }

    if (e.target.closest("[data-close-cart]")) $("#cart-drawer").hidden = true;
    if (e.target.closest("[data-close-account]")) $("#account-modal").hidden = true;

    const chip = e.target.closest(".chip");
    if (chip) {
      currentCat = chip.dataset.cat;
      $$(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      renderProducts();
    }
  });

  $("#cart-btn").addEventListener("click", () => {
    $("#cart-drawer").hidden = false;
  });

  $("#account-btn").addEventListener("click", () => {
    $("#account-modal").hidden = false;
  });

  $("#menu-toggle").addEventListener("click", () => {
    const nav = $("#main-nav");
    const open = nav.classList.toggle("is-open");
    $("#menu-toggle").setAttribute("aria-expanded", String(open));
  });

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim().toLowerCase();
    showView("productos");
    const list = products.filter((p) => p.name.toLowerCase().includes(q));
    $("#product-grid").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty">No encontramos resultados para “${q}”.</p>`;
  });

  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    toast("Mensaje enviado. Te contactaremos pronto.");
  });

  $("#account-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#account-modal").hidden = true;
    toast("Sesión iniciada en este dispositivo");
  });

  $("#checkout-btn").addEventListener("click", () => {
    if (!cart.length) {
      toast("Agrega productos antes de pagar");
      return;
    }
    cart = [];
    saveCart();
    $("#cart-drawer").hidden = true;
    toast("¡Compra registrada! Gracias por elegir TECHSTORE");
  });

  const hash = location.hash.replace("#", "");
  const map = {
    inicio: "home",
    productos: "productos",
    ofertas: "ofertas",
    contactos: "contactos",
    nosotros: "nosotros",
    faq: "faq",
    privacidad: "privacidad",
  };
  if (map[hash]) showView(map[hash]);
}

init();
