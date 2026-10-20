/**
 * CloudCart — Checkout Controller
 * Stripe/Apple Pay grade experience: interactive card simulator, atomic order completion
 */

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("checkout-form");
  const miniList = document.getElementById("checkout-mini-items");
  const subtotalEl = document.getElementById("co-subtotal");
  const shippingEl = document.getElementById("co-shipping");
  const discountRow = document.getElementById("co-discount-row");
  const discountEl = document.getElementById("co-discount");
  const totalEl = document.getElementById("co-total");
  const submitBtn = document.getElementById("submit-order-btn");
  const btnPayLabel = document.getElementById("btn-pay-label");
  const errorEl = document.getElementById("checkout-error");

  const checkoutView = document.getElementById("checkout-view");
  const successView = document.getElementById("order-success-view");
  const applePayBtn = document.getElementById("express-apple-pay");

  if (!form || !miniList) return;

  const cart = await API.getCart();

  // If cart is empty, redirect back to cart
  if (!cart.length) {
    location.href = "cart.html";
    return;
  }

  // Load calculations
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = Number(sessionStorage.getItem("cloudcart_checkout_discount") || 0);
  let shippingCost = 0;

  const updateTotal = () => {
    const total = Math.max(0, subtotal - discount + shippingCost);
    if (subtotalEl) subtotalEl.textContent = App.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shippingCost === 0 ? "FREE" : App.formatPrice(shippingCost);

    if (discount > 0 && discountRow && discountEl) {
      discountRow.hidden = false;
      discountEl.textContent = `-${App.formatPrice(discount)}`;
    }

    if (totalEl) totalEl.textContent = App.formatPrice(total);
    if (btnPayLabel) btnPayLabel.textContent = `Pay ${App.formatPrice(total)} & Complete Order`;
    return total;
  };

  // Render miniature items
  miniList.innerHTML = cart.map((item) => `
    <div class="checkout-mini-item">
      <div class="checkout-mini-thumb">
        <img src="${App.escape(item.image)}" alt="${App.escape(item.name)}" data-fallback>
        <span class="checkout-mini-badge">${item.quantity}</span>
      </div>
      <div class="checkout-mini-info">
        <strong>${App.escape(item.name)}</strong>
        <span>${App.escape(item.category || "Hardware")}</span>
      </div>
      <span class="checkout-mini-price">${App.formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join("");
  App.bindImageFallback(miniList);

  updateTotal();

  // Delivery radio selector
  const radioStandard = document.getElementById("delivery-standard");
  const radioPriority = document.getElementById("delivery-priority");

  if (radioStandard && radioPriority) {
    radioStandard.addEventListener("click", () => {
      radioStandard.classList.add("active");
      radioPriority.classList.remove("active");
      shippingCost = 0;
      updateTotal();
    });

    radioPriority.addEventListener("click", () => {
      radioPriority.classList.add("active");
      radioStandard.classList.remove("active");
      shippingCost = 299;
      updateTotal();
    });
  }

  // Payment tab switchers
  const tabCard = document.getElementById("tab-btn-card");
  const tabUpi = document.getElementById("tab-btn-upi");
  const tabNet = document.getElementById("tab-btn-net");
  const panelCard = document.getElementById("payment-card-panel");
  const panelUpi = document.getElementById("payment-upi-panel");
  const panelNet = document.getElementById("payment-net-panel");

  const setPaymentTab = (tab, panel) => {
    [tabCard, tabUpi, tabNet].forEach((t) => t && t.classList.remove("active"));
    [panelCard, panelUpi, panelNet].forEach((p) => p && (p.hidden = true));
    tab.classList.add("active");
    panel.hidden = false;
  };

  if (tabCard && tabUpi && tabNet) {
    tabCard.addEventListener("click", () => setPaymentTab(tabCard, panelCard));
    tabUpi.addEventListener("click", () => setPaymentTab(tabUpi, panelUpi));
    tabNet.addEventListener("click", () => setPaymentTab(tabNet, panelNet));
  }

  // Live Card Simulator
  const cardInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiry");
  const nameInput = document.getElementById("check-name");
  const cardNumDisplay = document.getElementById("card-number-display");
  const cardNameDisplay = document.getElementById("card-name-display");
  const cardExpDisplay = document.getElementById("card-expiry-display");
  const cardBrandDisplay = document.getElementById("card-brand-display");

  if (cardInput && cardNumDisplay) {
    cardInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 16);
      val = val.replace(/(\d{4})/g, "$1 ").trim();
      e.target.value = val;
      cardNumDisplay.textContent = val || "•••• •••• •••• 4242";

      // Detect card brand
      if (val.startsWith("4")) {
        if (cardBrandDisplay) cardBrandDisplay.textContent = "VISA";
      } else if (val.startsWith("5")) {
        if (cardBrandDisplay) cardBrandDisplay.textContent = "MASTERCARD";
      } else if (val.startsWith("3")) {
        if (cardBrandDisplay) cardBrandDisplay.textContent = "AMEX";
      } else {
        if (cardBrandDisplay) cardBrandDisplay.textContent = "CARD";
      }
    });
  }

  if (expiryInput && cardExpDisplay) {
    expiryInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 3) {
        val = val.slice(0, 2) + "/" + val.slice(2);
      }
      e.target.value = val;
      cardExpDisplay.textContent = val || "12/28";
    });
  }

  if (nameInput && cardNameDisplay) {
    nameInput.addEventListener("input", (e) => {
      cardNameDisplay.textContent = e.target.value.toUpperCase() || "AARAV SHARMA";
    });
  }

  // Complete Order Processor
  const processOrder = async (isExpress = false) => {
    errorEl.textContent = "";
    const total = updateTotal();

    const customerName = document.getElementById("check-name")?.value.trim() || "Guest Client";
    const customerEmail = document.getElementById("check-email")?.value.trim() || "client@studio.com";
    const customerCity = document.getElementById("check-city")?.value.trim() || "Bengaluru";

    if (!isExpress) {
      if (!customerName || !customerEmail) {
        errorEl.textContent = "Please fill in recipient name and email.";
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader"></i> Authorizing with Cloud Banking...`;
      App.refreshIcons();
    }

    try {
      const orderPayload = {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        total,
        customer: {
          name: customerName,
          email: customerEmail,
          city: customerCity
        },
        shipping: {
          method: shippingCost === 0 ? "Standard Ground Dispatch" : "Priority Dedicated Express",
          fee: shippingCost
        }
      };

      const result = await API.createOrder(orderPayload);
      const orderId = result.orderId || "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Show Order Success View
      if (checkoutView) checkoutView.hidden = true;
      if (successView) {
        successView.hidden = false;
        document.getElementById("receipt-order-id").textContent = orderId;
        document.getElementById("receipt-total").textContent = App.formatPrice(total);
        document.getElementById("receipt-shipping").textContent = shippingCost === 0 ? "Standard Air Dispatch (Free)" : "Priority Express Flight (₹299)";
        document.getElementById("receipt-customer").textContent = `${customerName} (${customerCity})`;
        
        const trackBtn = document.getElementById("track-order-btn-link");
        if (trackBtn) {
          trackBtn.href = `orders.html?id=${encodeURIComponent(orderId)}`;
        }
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + (shippingCost === 0 ? 3 : 1));
        document.getElementById("receipt-date").textContent = estDate.toLocaleDateString("en-IN", {
          weekday: "long",
          month: "short",
          day: "numeric"
        });
      }

      // Clear session promo
      sessionStorage.removeItem("cloudcart_promo");
      sessionStorage.removeItem("cloudcart_checkout_subtotal");
      sessionStorage.removeItem("cloudcart_checkout_discount");
      sessionStorage.removeItem("cloudcart_checkout_total");

      await App.updateCartBadge();
      App.toast("Order successfully authorized!");
      App.refreshIcons();
    } catch (err) {
      errorEl.textContent = err.message;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="lock"></i> Authorize & Complete Order`;
        App.refreshIcons();
      }
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    processOrder(false);
  });

  if (applePayBtn) {
    applePayBtn.addEventListener("click", () => {
      processOrder(true);
    });
  }
});
