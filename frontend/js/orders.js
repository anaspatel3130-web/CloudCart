/**
 * CloudCart — Order Tracking & Logistics Controller
 * Multi-stage telemetry, carrier tracking, and authenticated receipt generation
 */

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("track-order-form");
  const input = document.getElementById("track-order-id-input");
  const content = document.getElementById("order-tracking-content");
  const chipsContainer = document.getElementById("recent-order-chips");

  if (!content) return;

  const params = new URLSearchParams(location.search);
  const initialId = params.get("id");

  let allProducts = [];
  let userOrders = [];

  try {
    [allProducts, userOrders] = await Promise.all([
      API.getProducts(),
      API.getOrders(),
    ]);

    // Populate quick-select chips
    if (chipsContainer && userOrders.length) {
      chipsContainer.innerHTML = userOrders.slice(0, 5).map((o) => `
        <button class="filter-chip" type="button" data-select-order="${App.escape(o.id)}" style="font-size:0.75rem;padding:4px 10px;">
          ${App.escape(o.id)}
        </button>
      `).join("");

      chipsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-select-order]");
        if (btn) {
          const oid = btn.getAttribute("data-select-order");
          if (input) input.value = oid;
          trackOrder(oid);
        }
      });
    }

    if (initialId) {
      if (input) input.value = initialId;
      await trackOrder(initialId);
    } else if (userOrders.length) {
      // Auto-track most recent order
      const mostRecent = userOrders[0].id;
      if (input) input.value = mostRecent;
      await trackOrder(mostRecent);
    }
  } catch (err) {
    console.warn("Could not load initial orders telemetry:", err);
  }

  const stages = [
    { title: "Order Verified", desc: "DynamoDB Lock Confirmed", icon: "check" },
    { title: "Quality Audit", desc: "Serial Number Verified", icon: "shield-check" },
    { title: "In Transit", desc: "BlueDart Air Express", icon: "truck" },
    { title: "Out for Delivery", desc: "Assigned to Local Flight Hub", icon: "send" },
    { title: "Delivered", desc: "Signature Confirmed", icon: "home" },
  ];

  async function trackOrder(orderId) {
    content.innerHTML = `<div class="skeleton-card" style="height:380px;"></div>`;
    try {
      const order = await API.getOrderById(orderId);
      if (!order) throw new Error(`Order "${orderId}" could not be located.`);

      // Determine active stage based on order.status
      let activeIndex = 2; // Default In Transit for demo
      const st = String(order.status || "").toLowerCase();
      if (st.includes("confirm") || st.includes("sample")) activeIndex = 1;
      if (st.includes("dispatch") || st.includes("transit")) activeIndex = 2;
      if (st.includes("out")) activeIndex = 3;
      if (st.includes("deliver")) activeIndex = 4;

      const progressPct = Math.round((activeIndex / (stages.length - 1)) * 100);

      // Render timeline nodes
      const timelineNodes = stages.map((s, idx) => {
        let stateCls = "";
        if (idx < activeIndex) stateCls = "is-complete";
        else if (idx === activeIndex) stateCls = "is-active";

        return `
          <div class="tracker-node ${stateCls}">
            <div class="tracker-node-icon">
              <i data-lucide="${s.icon}"></i>
            </div>
            <strong class="tracker-node-title">${s.title}</strong>
            <span class="tracker-node-time">${s.desc}</span>
          </div>`;
      }).join("");

      // Render items breakdown
      const itemsList = (order.items || []).map((item) => {
        const prod = allProducts.find((p) => p.id === (item.productId || item.id)) || {};
        const name = prod.name || item.name || item.productId || "Hardware Object";
        const price = prod.price || item.price || 0;
        const qty = item.quantity || 1;
        const img = prod.image || item.image || "";

        return `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">
            <div style="width:50px;height:50px;border-radius:var(--radius-sm);overflow:hidden;background:#000;border:1px solid var(--border);flex-shrink:0;">
              ${img ? `<img src="${App.escape(img)}" alt="" style="width:100%;height:100%;object-fit:cover;" data-fallback>` : ""}
            </div>
            <div style="flex:1;">
              <strong style="display:block;font-size:0.92rem;"><a href="product.html?id=${encodeURIComponent(prod.id || item.productId)}">${App.escape(name)}</a></strong>
              <span style="font-size:0.75rem;color:var(--text-tertiary);">Qty: ${qty} × ${App.formatPrice(price)}</span>
            </div>
            <strong style="font-family:var(--font-mono);font-size:0.98rem;">${App.formatPrice(price * qty)}</strong>
          </div>`;
      }).join("");

      const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const customerName = order.customer?.name || "Client Patron";
      const customerEmail = order.customer?.email || "client@studio.com";
      const customerCity = order.customer?.city || "Bengaluru, India";

      content.innerHTML = `
        <article class="order-tracker-card">
          <!-- Header Bar -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:16px;">
            <div>
              <span class="product-info__cat">Consignment Ref</span>
              <h2 style="font-size:1.8rem;letter-spacing:-0.02em;">${App.escape(order.id)}</h2>
              <span style="font-size:0.78rem;color:var(--text-tertiary);">Recorded: ${dateStr}</span>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <span class="product-badge product-badge--neon" style="font-size:0.78rem;padding:6px 14px;">
                ● ${App.escape(order.status || "In Transit")}
              </span>
              <button class="btn btn--ghost btn--small" type="button" onclick="window.print()">
                <i data-lucide="printer"></i> Print Invoice
              </button>
            </div>
          </div>

          <!-- Multi-stage Timeline -->
          <div class="tracker-timeline">
            <div class="tracker-progress-line" style="width: ${progressPct}%;"></div>
            ${timelineNodes}
          </div>

          <!-- Details 2-Column Grid -->
          <div style="display:grid;grid-template-columns:1.2fr 0.9fr;gap:36px;margin-top:40px;align-items:start;">
            <!-- Package Contents -->
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;">
              <h3 style="font-size:1.15rem;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
                <i data-lucide="box"></i> Package Manifest
              </h3>
              <div>${itemsList}</div>
              
              <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:1.1rem;font-weight:700;">
                <span>Total Amount</span>
                <span style="color:var(--neon);font-family:var(--font-mono);">${App.formatPrice(order.total)}</span>
              </div>
            </div>

            <!-- Shipping Telemetry -->
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;display:flex;flex-direction:column;gap:16px;">
              <h3 style="font-size:1.15rem;display:flex;align-items:center;gap:8px;">
                <i data-lucide="map-pin"></i> Delivery Destination
              </h3>

              <div style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;">
                <strong style="color:var(--text-primary);display:block;font-size:0.95rem;">${App.escape(customerName)}</strong>
                <span>${App.escape(customerCity)}</span><br>
                <span>Email: ${App.escape(customerEmail)}</span>
              </div>

              <div style="border-top:1px solid var(--border);padding-top:14px;">
                <span style="font-size:0.75rem;color:var(--text-tertiary);text-transform:uppercase;">Carrier Telemetry</span>
                <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                  <i data-lucide="plane" style="color:var(--cyan);width:16px;height:16px;"></i>
                  <strong style="font-size:0.88rem;">CloudCart Priority Dedicated Flight</strong>
                </div>
                <span style="font-size:0.74rem;color:var(--text-secondary);font-family:var(--font-mono);">AWB: CC-IND-8849204</span>
              </div>

              <div style="border-top:1px solid var(--border);padding-top:14px;">
                <span style="font-size:0.75rem;color:var(--text-tertiary);text-transform:uppercase;">Cloud Guarantee</span>
                <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">
                  Tamper-evident studio seal verified. Backed by 24-month manufacturer warranty.
                </p>
              </div>
            </div>
          </div>
        </article>`;

      App.bindImageFallback(content);
      App.refreshIcons();
    } catch (err) {
      content.innerHTML = `
        <div style="text-align:center;padding:48px 20px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-xl);">
          <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,77,77,0.1);border:1px solid rgba(255,77,77,0.3);color:var(--danger);display:grid;place-items:center;margin:0 auto 14px;">
            <i data-lucide="alert-triangle"></i>
          </div>
          <h3 style="font-size:1.3rem;margin-bottom:6px;">Consignment Not Located</h3>
          <p style="color:var(--text-secondary);font-size:0.92rem;max-width:440px;margin:0 auto 18px;">
            ${App.escape(err.message)}
          </p>
          <a class="btn btn--ghost btn--small" href="products.html">Return to Store</a>
        </div>`;
      App.refreshIcons();
    }
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const queryId = input.value.trim();
      if (queryId) {
        trackOrder(queryId);
      }
    });
  }
});
