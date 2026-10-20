/**
 * CloudCart — Shopping Bag Controller
 * Item steppers, promotional vouchers, free shipping meter & checkout routing
 */

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  const shippingMeter = document.getElementById("shipping-meter");
  const meterStatus = document.getElementById("meter-status");
  const meterPercent = document.getElementById("meter-percent");
  const meterFill = document.getElementById("meter-fill");
  const voucherInput = document.getElementById("voucher-code");
  const applyVoucherBtn = document.getElementById("apply-voucher");
  const voucherMsg = document.getElementById("voucher-message");
  const discountRow = document.getElementById("discount-row");
  const discountLabel = document.getElementById("discount-label");
  const summaryDiscount = document.getElementById("summary-discount");

  if (!list) return;

  const FREE_SHIPPING_THRESHOLD = 5000;
  let activeDiscountPercent = 0;
  let activeDiscountAmount = 0;

  // Restore voucher from session if existing
  const savedVoucher = sessionStorage.getItem("cloudcart_promo");
  if (savedVoucher && typeof PROMO_CODES !== "undefined" && PROMO_CODES[savedVoucher]) {
    const promo = PROMO_CODES[savedVoucher];
    activeDiscountPercent = promo.discountPercent || 0;
    activeDiscountAmount = promo.discountAmount || 0;
    if (voucherInput) voucherInput.value = savedVoucher;
  }

  const emptyMarkup = () => `
    <div style="text-align:center;padding:72px 20px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-xl);">
      <div style="width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,0.03);border:1px solid var(--border);display:grid;place-items:center;margin:0 auto 20px;color:var(--text-tertiary);">
        <i data-lucide="shopping-bag" style="width:28px;height:28px;"></i>
      </div>
      <h3 style="font-size:1.6rem;margin-bottom:8px;">Your Shopping Bag is Empty</h3>
      <p style="color:var(--text-secondary);font-size:0.95rem;max-width:440px;margin:0 auto 28px;">
        Curate your everyday workflow. Explore our edited collection of acoustics, desk architecture, and minimal tools.
      </p>
      <a class="btn btn--primary btn--large" href="products.html">
        Explore Collection <i data-lucide="arrow-right"></i>
      </a>
    </div>`;

  const render = async () => {
    const cart = await API.getCart();

    if (!cart.length) {
      list.innerHTML = emptyMarkup();
      if (summary) summary.hidden = true;
      if (shippingMeter) shippingMeter.hidden = true;
      const aiSection = document.getElementById("ai-smart-cart-section");
      if (aiSection) aiSection.hidden = true;
      App.updateCartBadge();
      App.refreshIcons();
      return;
    }

    if (summary) summary.hidden = false;
    if (shippingMeter) shippingMeter.hidden = false;

    list.innerHTML = cart
      .map((item) => {
        const img = item.image
          ? `<img src="${App.escape(item.image)}" alt="${App.escape(item.name)}" data-fallback>`
          : `<div class="product-card__fallback">No image</div>`;

        return `
          <article class="cart-item" data-item="${App.escape(item.productId)}">
            <div class="cart-item__media">
              <a href="product.html?id=${encodeURIComponent(item.productId)}">${img}</a>
            </div>
            <div class="cart-item__details">
              <span class="product-card__cat">${App.escape(item.category || "Collection")}</span>
              <h3><a href="product.html?id=${encodeURIComponent(item.productId)}">${App.escape(item.name)}</a></h3>
              <div class="unit-price">${App.formatPrice(item.price)} each</div>
              <div class="qty-stepper" role="group" aria-label="Quantity for ${App.escape(item.name)}">
                <button class="qty-btn" type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" type="button" data-qty="1" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="cart-item__side">
              <strong class="cart-item__total">${App.formatPrice(item.price * item.quantity)}</strong>
              <button class="btn btn--danger btn--small" type="button" data-remove aria-label="Remove item">
                <i data-lucide="trash-2"></i> Remove
              </button>
            </div>
          </article>`;
      })
      .join("");

    App.bindImageFallback(list);
    App.refreshIcons();

    // Calculations
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    // Free shipping calculation
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      if (meterStatus) meterStatus.innerHTML = `<span>🎉 You unlocked <strong>Complimentary Express Air Shipping!</strong></span>`;
      if (meterPercent) meterPercent.textContent = `100%`;
      if (meterFill) meterFill.style.width = `100%`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      if (meterStatus) meterStatus.innerHTML = `<span>Add <strong>${App.formatPrice(remaining)}</strong> more to unlock Free Express Delivery</span>`;
      if (meterPercent) meterPercent.textContent = `${pct}%`;
      if (meterFill) meterFill.style.width = `${pct}%`;
    }

    // Discounts
    let discountAmount = 0;
    if (activeDiscountPercent > 0) {
      discountAmount = Math.round((subtotal * activeDiscountPercent) / 100);
    } else if (activeDiscountAmount > 0) {
      discountAmount = Math.min(subtotal, activeDiscountAmount);
    }

    if (discountAmount > 0 && discountRow && summaryDiscount) {
      discountRow.hidden = false;
      summaryDiscount.textContent = `-${App.formatPrice(discountAmount)}`;
    } else if (discountRow) {
      discountRow.hidden = true;
    }

    const total = Math.max(0, subtotal - discountAmount);

    document.getElementById("summary-subtotal").textContent = App.formatPrice(subtotal);
    document.getElementById("summary-total").textContent = App.formatPrice(total);

    // Save final amounts to session for checkout
    sessionStorage.setItem("cloudcart_checkout_subtotal", String(subtotal));
    sessionStorage.setItem("cloudcart_checkout_discount", String(discountAmount));
    sessionStorage.setItem("cloudcart_checkout_total", String(total));

    App.updateCartBadge();

    // Fetch and display Aether AI Smart Cart Insights
    const aiSection = document.getElementById("ai-smart-cart-section");
    const aiAdvice = document.getElementById("ai-cart-advice");
    const aiGrid = document.getElementById("ai-cart-recommendations-grid");
    if (aiSection && aiGrid) {
      try {
        const insights = await API.getAiInsights({ type: "cart", cartItems: cart });
        if (insights && Array.isArray(insights.suggestedAddons) && insights.suggestedAddons.length) {
          aiSection.hidden = false;
          if (aiAdvice) aiAdvice.textContent = insights.adviceMessage || "";
          aiGrid.innerHTML = insights.suggestedAddons.map(App.productCard).join("");
          App.bindImageFallback(aiGrid);
          App.refreshIcons();
        } else {
          aiSection.hidden = true;
        }
      } catch {
        aiSection.hidden = true;
      }
    }
  };

  // Stepper and Remove event delegation
  list.addEventListener("click", async (event) => {
    const row = event.target.closest("[data-item]");
    if (!row) return;
    const id = row.getAttribute("data-item");

    if (event.target.closest("[data-remove]")) {
      await API.removeFromCart(id);
      App.toast("Removed from your bag");
      await render();
      return;
    }

    const qtyBtn = event.target.closest("[data-qty]");
    if (qtyBtn) {
      const cart = await API.getCart();
      const item = cart.find((i) => i.productId === id);
      if (!item) return;

      const delta = Number(qtyBtn.getAttribute("data-qty"));
      const next = item.quantity + delta;

      try {
        await API.updateCartQuantity(id, next);
        await render();
      } catch (err) {
        App.toast(err.message, "error");
      }
    }
  });

  // Apply promo voucher handler
  if (applyVoucherBtn && voucherInput) {
    applyVoucherBtn.addEventListener("click", () => {
      const code = voucherInput.value.trim().toUpperCase();
      if (!code) {
        if (voucherMsg) {
          voucherMsg.textContent = "Please enter a promo voucher code.";
          voucherMsg.style.color = "var(--danger)";
        }
        return;
      }

      if (typeof PROMO_CODES !== "undefined" && PROMO_CODES[code]) {
        const promo = PROMO_CODES[code];
        activeDiscountPercent = promo.discountPercent || 0;
        activeDiscountAmount = promo.discountAmount || 0;
        sessionStorage.setItem("cloudcart_promo", code);

        if (voucherMsg) {
          voucherMsg.textContent = `Applied: ${promo.label}`;
          voucherMsg.style.color = "var(--neon)";
        }
        if (discountLabel) discountLabel.textContent = promo.label;
        App.toast(`Promo code "${code}" applied!`);
        render();
      } else {
        if (voucherMsg) {
          voucherMsg.textContent = "Invalid code. Try CLOUDCART10 for 10% off.";
          voucherMsg.style.color = "var(--danger)";
        }
      }
    });
  }

  await render();
});
