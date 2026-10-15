// PENTING: Ganti nomor di bawah dengan nomor WhatsApp admin.
 // Format internasional tanpa tanda +, spasi, atau angka 0 di depan.
 // Contoh nomor Indonesia: 6281234567890
const WHATSAPP_NUMBER = "6283139460735";

const cart = {};
const rupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(value);

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function addToCart(name, price) {
  if (cart[name]) cart[name].qty += 1;
  else cart[name] = { price: Number(price), qty: 1 };
  renderCart();
  showToast(`${name} ditambahkan ke keranjang`);
}
function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  renderCart();
}
function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((sum, [, item]) => sum + item.qty, 0);
  const total = entries.reduce((sum, [, item]) => sum + item.qty * item.price, 0);
  cartCount.textContent = count;
  cartTotal.textContent = rupiah(total);
  if (!entries.length) {
    cartItems.innerHTML = '<div class="empty-cart">Keranjangmu masih kosong.<br><span>Pilih menu yang kamu suka, ya!</span></div>';
    return;
  }
  cartItems.innerHTML = entries.map(([name, item]) => `
    <div class="cart-row">
      <div><h4>${escapeHtml(name)}</h4><span class="row-price">${rupiah(item.price * item.qty)}</span></div>
      <div class="qty-control">
        <button type="button" data-change="-1" data-name="${escapeHtml(name)}" aria-label="Kurangi ${escapeHtml(name)}">−</button>
        <span>${item.qty}</span>
        <button type="button" data-change="1" data-name="${escapeHtml(name)}" aria-label="Tambah ${escapeHtml(name)}">+</button>
      </div>
    </div>`).join("");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
}
function checkout() {
  const entries = Object.entries(cart);
  if (!entries.length) {
    showToast("Keranjang masih kosong. Pilih menu terlebih dahulu.");
    return;
  }
  const name = document.getElementById("customerName").value.trim();
  const note = document.getElementById("orderNote").value.trim();
  if (!name) {
    document.getElementById("customerName").focus();
    showToast("Isi nama pemesan terlebih dahulu.");
    return;
  }
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER === "6283139460735") {
    showToast("Atur nomor WhatsApp admin di file script.js terlebih dahulu.");
    return;
  }
  const total = entries.reduce((sum, [, item]) => sum + item.qty * item.price, 0);
  const lines = entries.map(([itemName, item]) =>
    `• ${itemName} x${item.qty} — ${rupiah(item.qty * item.price)}`
  );
  const message = [
    "Halo Ruang Rasa Coffee House! Saya ingin memesan:",
    "",
    ...lines,
    "",
    `Total sementara: ${rupiah(total)}`,
    `Nama pemesan: ${name}`,
    note ? `Catatan: ${note}` : "",
    "",
    "Mohon konfirmasi ketersediaan dan total akhirnya. Terima kasih!"
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".order-item, .quick-add").forEach(button => {
  button.addEventListener("click", () => addToCart(button.dataset.name, button.dataset.price));
});
document.querySelectorAll(".category-pill").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-pill").forEach(pill => pill.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    document.querySelectorAll(".menu-card").forEach(card => {
      card.hidden = filter !== "semua" && card.dataset.category !== filter;
    });
  });
});
cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-change]");
  if (button) changeQty(button.dataset.name, Number(button.dataset.change));
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("checkout").addEventListener("click", checkout);
document.getElementById("bottomOrder").addEventListener("click", () => {
  openCart();
  if (!Object.keys(cart).length) showToast("Pilih menu dahulu untuk mulai memesan.");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});
renderCart();
