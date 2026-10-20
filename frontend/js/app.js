/**
 * CloudCart — Core Application Chrome, Global State & Utilities
 * World-Class UI/UX Inspired by Apple, Stripe & Futuristic Tech
 */

const App = {
  page() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    return file === "" ? "index.html" : file;
  },

  formatPrice(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "₹0";
    return "₹" + Math.round(n).toLocaleString("en-IN");
  },

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  stockLabel(stock) {
    if (stock <= 0) return { text: "Out of stock", cls: "stock-pill stock-pill--out", badgeCls: "product-badge--out" };
    if (stock <= CONFIG.lowStockAt) return { text: `Low stock (${stock} left)`, cls: "stock-pill stock-pill--low", badgeCls: "product-badge--low" };
    return { text: "In stock", cls: "stock-pill", badgeCls: "" };
  },

  bindImageFallback(root) {
    (root || document).querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        const wrap = img.parentElement;
        img.remove();
        if (wrap && !wrap.querySelector(".product-card__fallback")) {
          const fallback = document.createElement("div");
          fallback.className = "product-card__fallback";
          fallback.innerHTML = `<i data-lucide="image-off"></i><span>Image unavailable</span>`;
          wrap.appendChild(fallback);
          App.refreshIcons();
        }
      });
    });
  },

  productCard(product) {
    const stock = App.stockLabel(product.stock);
    const oldPrice = product.previousPrice
      ? `<span class="price--old">${App.formatPrice(product.previousPrice)}</span>`
      : "";
    const isOut = product.stock <= 0;
    const disabled = isOut ? "disabled" : "";
    const cta = isOut ? "Sold Out" : "Add to bag";

    let badges = "";
    if (product.newArrival) {
      badges += `<span class="product-badge product-badge--neon">New</span>`;
    } else if (product.featured) {
      badges += `<span class="product-badge product-badge--cyan">Featured</span>`;
    }
    if (stock.badgeCls) {
      badges += `<span class="product-badge ${stock.badgeCls}">${isOut ? "Out of Stock" : "Low Stock"}</span>`;
    }

    return `
      <article class="product-card" data-card-id="${App.escape(product.id)}">
        <div class="product-card__media">
          <div class="product-card__badges">${badges}</div>
          <a href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${App.escape(product.name)}">
            ${
              product.image
                ? `<img src="${App.escape(product.image)}" alt="${App.escape(product.name)}" loading="lazy" data-fallback>`
                : `<div class="product-card__fallback">No image</div>`
            }
          </a>
          <div class="product-card__quick-actions">
            <button class="btn btn--ghost btn--small btn--block" type="button" data-quick-view="${App.escape(product.id)}">
              <i data-lucide="eye"></i> Quick View
            </button>
          </div>
        </div>
        <div class="product-card__body">
          <div class="product-card__header">
            <span class="product-card__cat">${App.escape(product.category)}</span>
            <span class="product-card__rating">
              <i data-lucide="star"></i> ${product.rating || "4.8"}
            </span>
          </div>
          <h3 class="product-card__name">
            <a href="product.html?id=${encodeURIComponent(product.id)}">${App.escape(product.name)}</a>
          </h3>
          <div class="product-card__prices">
            <span class="price">${App.formatPrice(product.price)}</span>
            ${oldPrice}
          </div>
          <div class="product-card__footer">
            <span class="${stock.cls}"><span class="dot"></span> ${stock.text}</span>
            <button class="btn btn--primary btn--small" type="button" data-add-to-cart="${App.escape(product.id)}" ${disabled}>
              <i data-lucide="shopping-bag"></i> ${cta}
            </button>
          </div>
        </div>
      </article>`;
  },

  renderChrome() {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    const page = App.page();
    const isHome = page === "index.html" || page === "";
    const isProducts = page === "products.html" || page === "product.html";
    const isCart = page === "cart.html" || page === "checkout.html";
    const isOrders = page === "orders.html";
    const isAdmin = page === "admin.html";

    if (header) {
      header.innerHTML = `
        <div class="announce">
          <div class="announce-inner">
            <span class="announce-pill"><span class="pulse-dot"></span> STUDIO VOL. 01</span>
            <span>PRECISION HARDWARE · DESIGNED FOR NEXT-GEN WORKFLOWS</span>
          </div>
        </div>
        <nav class="navbar" aria-label="Primary navigation">
          <div class="navbar__inner">
            <a class="wordmark" href="index.html" aria-label="CloudCart home">
              <span class="wordmark__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 19a4 4 0 0 1-1-7.8A5 5 0 0 1 14.5 7a4 4 0 0 1 5.5 4.3A3.5 3.5 0 0 1 18 19H6z"/>
                </svg>
              </span>
              <span class="wordmark__text">Cloud<em>Cart</em></span>
              <span class="wordmark__tag">v1.2</span>
            </a>
            <div class="nav-links">
              <a href="products.html"${isProducts ? ' aria-current="page"' : ""}>Shop Catalog</a>
              <a href="${isHome ? "#collections" : "index.html#collections"}">Collections</a>
              <a href="products.html?filter=new">New Arrivals</a>
              <a href="orders.html"${isOrders ? ' aria-current="page"' : ""}>Track Order</a>
              <a href="admin.html"${isAdmin ? ' aria-current="page"' : ""}>Admin Console</a>
            </div>
            <div class="nav-actions">
              <span class="nav-status">
                <span class="pulse-dot"></span> AWS Edge Ready
              </span>
              <button class="icon-btn" type="button" data-open="search" aria-label="Quick Search">
                <i data-lucide="search"></i>
              </button>
              <button class="icon-btn" type="button" data-open="account" aria-label="Account details">
                <i data-lucide="user"></i>
              </button>
              <a class="icon-btn" href="cart.html"${isCart ? ' aria-current="page"' : ""} aria-label="Shopping bag">
                <i data-lucide="shopping-bag"></i>
                <span class="cart-count" id="cart-count">0</span>
              </a>
              <button class="icon-btn nav-toggle" type="button" data-open="menu" aria-label="Toggle menu" aria-expanded="false">
                <i data-lucide="menu"></i>
              </button>
            </div>
          </div>
        </nav>
        <div class="mobile-drawer" id="mobile-drawer" hidden>
          <nav aria-label="Mobile Navigation">
            <a href="products.html">Shop Catalog</a>
            <a href="${isHome ? "#collections" : "index.html#collections"}">Curated Rooms</a>
            <a href="products.html?filter=new">New Arrivals</a>
            <a href="orders.html">Track Order</a>
            <a href="cart.html">Shopping Bag</a>
            <a href="admin.html">Admin Console</a>
          </nav>
        </div>`;
    }

    if (footer) {
      footer.innerHTML = `
        <div class="container footer__grid">
          <div class="footer__brand">
            <a class="wordmark" href="index.html">
              <span class="wordmark__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 19a4 4 0 0 1-1-7.8A5 5 0 0 1 14.5 7a4 4 0 0 1 5.5 4.3A3.5 3.5 0 0 1 18 19H6z"/>
                </svg>
              </span>
              <span class="wordmark__text">Cloud<em>Cart</em></span>
            </a>
            <p>A flagship e-commerce storefront engineered for zero-latency serverless architectures. Built with calm tactile surfaces, bespoke hardware objects, and pixel-perfect design standards.</p>
          </div>
          <div class="footer__col">
            <h4>Catalog</h4>
            <nav>
              <a href="products.html">All Objects</a>
              <a href="products.html?category=Audio">Acoustics & Audio</a>
              <a href="products.html?category=Desk%20Setup">Desk Architecture</a>
              <a href="products.html?category=Accessories">Workspace Tools</a>
              <a href="products.html?category=Mobile%20Essentials">Mobile Carry</a>
            </nav>
          </div>
          <div class="footer__col">
            <h4>Architecture</h4>
            <div class="footer__tech-specs">
              <span class="tech-badge"><i data-lucide="server"></i> AWS Lambda API</span>
              <span class="tech-badge"><i data-lucide="database"></i> Amazon DynamoDB</span>
              <span class="tech-badge"><i data-lucide="shield-check"></i> Amazon Cognito Auth</span>
              <span class="tech-badge"><i data-lucide="cloud"></i> Amazon S3 + CloudFront</span>
            </div>
          </div>
          <div class="footer__col">
            <h4>Studio Dispatch</h4>
            <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:14px;">Receive architectural field notes and early hardware drop notifications.</p>
            <form class="newsletter" id="newsletter-form" novalidate style="display:flex;gap:8px;">
              <input class="input" id="newsletter-email" name="email" type="email" placeholder="client@studio.com" required style="height:44px;">
              <button class="btn btn--primary btn--small" type="submit" style="height:44px;">Join</button>
            </form>
            <p class="field-error" id="newsletter-error"></p>
          </div>
        </div>
        <div class="container footer__bottom">
          <span>© 2026 CloudCart Inc. Engineered with precision. Educational flagship demo.</span>
          <div class="footer__bottom-links">
            <a href="admin.html">Admin Sandbox</a>
            <a href="products.html">Catalog</a>
            <a href="cart.html">Bag</a>
          </div>
        </div>`;
    }

    if (!document.getElementById("ui-overlay")) {
      const extras = document.createElement("div");
      extras.innerHTML = `
        <div class="overlay" id="ui-overlay" hidden></div>
        
        <!-- Live Global Search Modal -->
        <div class="dialog" id="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title" hidden>
          <div class="dialog__header">
            <div>
              <h2 id="search-title" style="font-size:1.4rem;">Search Catalogue</h2>
              <p style="color:var(--text-secondary);font-size:0.85rem;">Find hardware across audio, desk, and mobile essentials.</p>
            </div>
            <button class="dialog__close" type="button" data-close-dialogs aria-label="Close dialog">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div class="search-input-wrap" style="max-width:100%;margin-bottom:12px;">
            <i data-lucide="search"></i>
            <input class="input" id="global-live-search" type="search" placeholder="Search by name, spec, or category..." autocomplete="off" />
          </div>
          <div class="search-results-preview" id="live-search-results">
            <p style="color:var(--text-tertiary);font-size:0.85rem;padding:8px 0;">Type at least 2 characters to explore...</p>
          </div>
        </div>

        <!-- Account / Project Info Dialog -->
        <div class="dialog" id="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title" hidden>
          <div class="dialog__header">
            <h2 id="account-title" style="font-size:1.4rem;">CloudCart Session</h2>
            <button class="dialog__close" type="button" data-close-dialogs aria-label="Close dialog">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:40px;height:40px;border-radius:50%;background:var(--neon-glow-soft);border:1px solid var(--neon);color:var(--neon);display:grid;place-items:center;font-weight:700;">CC</div>
              <div>
                <strong style="display:block;font-size:0.95rem;">Demo Architect Session</strong>
                <span style="font-size:0.75rem;color:var(--neon);font-family:var(--font-mono);">Client ID: ${CONFIG.userId}</span>
              </div>
            </div>
            <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">This frontend operates in full local sandbox mode or can be attached to live AWS API Gateway via <code>js/config.js</code>.</p>
          </div>
          <div style="display:grid;gap:10px;">
            <a class="btn btn--primary btn--block" href="admin.html">Launch Admin Console</a>
            <button class="btn btn--ghost btn--block" type="button" data-close-dialogs>Dismiss</button>
          </div>
        </div>

        <!-- Quick View Dialog -->
        <div class="dialog dialog--large" id="quick-view-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" hidden>
          <div class="dialog__header" style="margin-bottom:16px;">
            <span class="product-info__cat" id="qv-cat">Audio</span>
            <button class="dialog__close" type="button" data-close-dialogs aria-label="Close modal">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div id="quick-view-content"></div>
        </div>

        <!-- Aether AI Assistant Floating FAB -->
        <button class="ai-trigger-fab" id="ai-trigger-fab" type="button" aria-label="Open Aether AI Shopping Assistant">
          <i data-lucide="sparkles"></i>
          <span>Aether AI</span>
        </button>

        <!-- Aether AI Assistant Chat Drawer -->
        <div class="ai-drawer" id="ai-chat-drawer" role="dialog" aria-modal="true" aria-label="Aether AI Assistant" hidden>
          <div class="ai-drawer-header">
            <div class="ai-header-info">
              <div class="ai-avatar-icon">
                <i data-lucide="cpu"></i>
              </div>
              <div>
                <h3>Aether Hardware Advisor</h3>
                <span><span class="pulse-dot"></span> LIVE CATALOG INTELLIGENCE</span>
              </div>
            </div>
            <button class="dialog__close" id="close-ai-drawer" type="button" aria-label="Close assistant">
              <i data-lucide="x"></i>
            </button>
          </div>

          <!-- Quick Suggestion Prompt Chips -->
          <div class="ai-chips-scroll" id="ai-chips-list">
            <button class="ai-chip" type="button" data-prompt="Recommend an audio setup under ₹5,000">🎧 Audio under ₹5k</button>
            <button class="ai-chip" type="button" data-prompt="Best tools for an ergonomic desk setup">⌨️ Desk ergonomics</button>
            <button class="ai-chip" type="button" data-prompt="What are the newest hardware arrivals?">⚡ New arrivals</button>
            <button class="ai-chip" type="button" data-prompt="Compare Aether Wireless Headphones vs Pulse Speaker">⚖️ Compare flagships</button>
          </div>

          <!-- Messages Stream -->
          <div class="ai-messages-container" id="ai-messages-stream">
            <div class="ai-msg ai-msg--bot">
              <div class="ai-bubble">
                Greetings. I am <strong>Aether</strong>, your CloudCart hardware advisor.
                How can I assist your workflow today? You can ask about acoustic specs, desk architecture, or specify any budget constraint.
              </div>
            </div>
          </div>

          <!-- Chat Input Form -->
          <form class="ai-drawer-form" id="ai-chat-form">
            <input class="ai-drawer-input" id="ai-user-input" type="text" placeholder="Ask Aether about any hardware or budget..." autocomplete="off" required />
            <button class="ai-send-btn" type="submit" aria-label="Send query">
              <i data-lucide="send"></i>
            </button>
          </form>
        </div>

        <div class="toast-stack" id="toast-stack"></div>`;
      document.body.appendChild(extras);
    }

    App.refreshIcons();
    App.updateCartBadge();
    App.bindNavbarScroll();
  },

  bindNavbarScroll() {
    window.addEventListener("scroll", () => {
      const nav = document.querySelector(".navbar");
      if (nav) {
        nav.classList.toggle("navbar--scrolled", window.scrollY > 20);
      }
    });
  },

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  },

  async updateCartBadge() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const cart = await API.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    el.textContent = String(count);
    el.classList.toggle("is-visible", count > 0);
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 350);
  },

  toast(message, type = "success") {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = "toast" + (type === "error" ? " toast--error" : "");
    const icon = type === "error" ? "alert-circle" : "check-circle-2";
    node.innerHTML = `<i data-lucide="${icon}"></i><span>${App.escape(message)}</span>`;
    stack.appendChild(node);
    App.refreshIcons();
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(8px)";
      setTimeout(() => node.remove(), 260);
    }, 2800);
  },

  closeDialogs() {
    ["search-dialog", "account-dialog", "quick-view-dialog", "ui-overlay", "mobile-drawer"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("is-open");
      el.hidden = true;
    });
    const toggle = document.querySelector("[data-open='menu']");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  },

  openDialog(name) {
    if (name === "menu") {
      const drawer = document.getElementById("mobile-drawer");
      const toggle = document.querySelector("[data-open='menu']");
      const open = !drawer.classList.contains("is-open");
      drawer.hidden = !open;
      drawer.classList.toggle("is-open", open);
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      return;
    }
    App.closeDialogs();
    const overlay = document.getElementById("ui-overlay");
    const dialog = document.getElementById(name + "-dialog");
    if (!dialog) return;
    overlay.hidden = false;
    overlay.classList.add("is-open");
    dialog.hidden = false;
    dialog.classList.add("is-open");
    const input = dialog.querySelector("input");
    if (input) input.focus();
  },

  async openQuickView(productId) {
    const dialog = document.getElementById("quick-view-dialog");
    const content = document.getElementById("quick-view-content");
    const catLabel = document.getElementById("qv-cat");
    if (!dialog || !content) return;

    content.innerHTML = `<div class="skeleton-card" style="height:320px;"></div>`;
    App.openDialog("quick-view");

    try {
      const product = await API.getProduct(productId);
      if (!product) throw new Error("Product details not available.");
      if (catLabel) catLabel.textContent = product.category;

      const stock = App.stockLabel(product.stock);
      const isOut = product.stock <= 0;

      content.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:center;">
          <div style="aspect-ratio:1/1;border-radius:var(--radius-lg);overflow:hidden;background:#090C11;border:1px solid var(--border);">
            <img src="${App.escape(product.image)}" alt="${App.escape(product.name)}" style="width:100%;height:100%;object-fit:cover;" data-fallback>
          </div>
          <div>
            <h2 id="quick-view-title" style="font-size:1.8rem;margin-bottom:8px;">${App.escape(product.name)}</h2>
            <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:14px;">
              <span class="price" style="font-size:1.6rem;color:var(--neon);">${App.formatPrice(product.price)}</span>
              ${product.previousPrice ? `<span class="price--old">${App.formatPrice(product.previousPrice)}</span>` : ""}
            </div>
            <p style="color:var(--text-secondary);font-size:0.92rem;line-height:1.6;margin-bottom:18px;">${App.escape(product.description)}</p>
            <div style="margin-bottom:20px;">
              <span class="${stock.cls}"><span class="dot"></span> ${stock.text}</span>
            </div>
            <div style="display:flex;gap:12px;">
              <button class="btn btn--primary" type="button" data-add-to-cart="${App.escape(product.id)}" ${isOut ? "disabled" : ""} style="flex:1;">
                <i data-lucide="shopping-bag"></i> ${isOut ? "Sold Out" : "Add to Bag"}
              </button>
              <a class="btn btn--ghost" href="product.html?id=${encodeURIComponent(product.id)}" style="flex:1;">
                Full Details <i data-lucide="arrow-right"></i>
              </a>
            </div>
          </div>
        </div>`;
      App.bindImageFallback(content);
      App.refreshIcons();
    } catch (err) {
      content.innerHTML = `<div class="field-error">${App.escape(err.message)}</div>`;
    }
  },

  bindGlobalEvents() {
    document.addEventListener("click", async (event) => {
      // Add to cart click
      const addBtn = event.target.closest("[data-add-to-cart]");
      if (addBtn) {
        event.preventDefault();
        const id = addBtn.getAttribute("data-add-to-cart");
        addBtn.disabled = true;
        const prevText = addBtn.innerHTML;
        addBtn.innerHTML = `<i data-lucide="loader"></i> Adding...`;
        App.refreshIcons();
        try {
          await API.addToCart(id, 1);
          await App.updateCartBadge();
          App.toast("Added to your shopping bag");
          addBtn.innerHTML = `<i data-lucide="check"></i> Added ✓`;
          setTimeout(() => {
            addBtn.innerHTML = prevText;
            addBtn.disabled = false;
            App.refreshIcons();
          }, 1200);
        } catch (err) {
          App.toast(err.message, "error");
          addBtn.innerHTML = prevText;
          addBtn.disabled = false;
          App.refreshIcons();
        }
        return;
      }

      // Quick View Click
      const qvBtn = event.target.closest("[data-quick-view]");
      if (qvBtn) {
        event.preventDefault();
        App.openQuickView(qvBtn.getAttribute("data-quick-view"));
        return;
      }

      // Dialog openers
      const open = event.target.closest("[data-open]");
      if (open) {
        event.preventDefault();
        App.openDialog(open.getAttribute("data-open"));
        return;
      }

      // Close dialogs
      if (event.target.closest("[data-close-dialogs]") || event.target.id === "ui-overlay") {
        App.closeDialogs();
      }

      // AI FAB Trigger
      if (event.target.closest("#ai-trigger-fab")) {
        const drawer = document.getElementById("ai-chat-drawer");
        if (drawer) {
          const isOpen = drawer.classList.contains("is-open");
          drawer.hidden = isOpen;
          drawer.classList.toggle("is-open", !isOpen);
          if (!isOpen) {
            const input = document.getElementById("ai-user-input");
            if (input) input.focus();
          }
        }
        return;
      }

      // Close AI Drawer
      if (event.target.closest("#close-ai-drawer")) {
        const drawer = document.getElementById("ai-chat-drawer");
        if (drawer) {
          drawer.classList.remove("is-open");
          drawer.hidden = true;
        }
        return;
      }

      // AI Suggestion Prompt Chips
      const chip = event.target.closest("[data-prompt]");
      if (chip) {
        const promptText = chip.getAttribute("data-prompt");
        const input = document.getElementById("ai-user-input");
        if (input) {
          input.value = promptText;
          const form = document.getElementById("ai-chat-form");
          if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
        }
        return;
      }

      const drawerLink = event.target.closest("#mobile-drawer a");
      if (drawerLink) App.closeDialogs();
    });

    // AI Chat Form Submit
    document.addEventListener("submit", async (event) => {
      if (event.target.id === "ai-chat-form") {
        event.preventDefault();
        const input = document.getElementById("ai-user-input");
        const stream = document.getElementById("ai-messages-stream");
        if (!input || !stream) return;

        const text = input.value.trim();
        if (!text) return;
        input.value = "";

        // Append User Bubble
        const userMsg = document.createElement("div");
        userMsg.className = "ai-msg ai-msg--user";
        userMsg.innerHTML = `<div class="ai-bubble">${App.escape(text)}</div>`;
        stream.appendChild(userMsg);

        // Append Bot Typing Indicator
        const botMsg = document.createElement("div");
        botMsg.className = "ai-msg ai-msg--bot";
        botMsg.innerHTML = `<div class="ai-bubble" style="display:flex;align-items:center;gap:6px;"><span class="pulse-dot"></span> <em>Consulting studio knowledge...</em></div>`;
        stream.appendChild(botMsg);
        stream.scrollTop = stream.scrollHeight;

        try {
          const res = await API.sendAiMessage({ message: text });
          const formattedReply = App.escape(res.reply || "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n\n/g, "<br><br>")
            .replace(/\n•/g, "<br>•");

          let cardsMarkup = "";
          if (Array.isArray(res.recommendations) && res.recommendations.length) {
            cardsMarkup = `
              <div class="ai-rec-cards">
                ${res.recommendations.slice(0, 3).map((p) => `
                  <div class="ai-rec-card">
                    <div class="ai-rec-thumb">
                      <img src="${App.escape(p.image)}" alt="${App.escape(p.name)}" data-fallback>
                    </div>
                    <div class="ai-rec-info">
                      <strong>${App.escape(p.name)}</strong>
                      <span class="rec-price">${App.formatPrice(p.price)}</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                      <a class="btn btn--ghost btn--small" href="product.html?id=${encodeURIComponent(p.id)}" style="height:30px;padding:0 8px;font-size:0.7rem;">View</a>
                      <button class="btn btn--primary btn--small" type="button" data-add-to-cart="${App.escape(p.id)}" style="height:30px;padding:0 8px;font-size:0.7rem;">+ Bag</button>
                    </div>
                  </div>
                `).join("")}
              </div>`;
          }

          botMsg.innerHTML = `<div class="ai-bubble">${formattedReply}</div>${cardsMarkup}`;
          App.bindImageFallback(botMsg);
          App.refreshIcons();
        } catch (err) {
          botMsg.innerHTML = `<div class="ai-bubble" style="color:var(--danger);">${App.escape(err.message)}</div>`;
        }
        stream.scrollTop = stream.scrollHeight;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") App.closeDialogs();
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        App.openDialog("search");
      }
    });

    // Live search listener
    let searchDebounce;
    document.addEventListener("input", (event) => {
      if (event.target.id === "global-live-search") {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(async () => {
          const q = event.target.value.trim().toLowerCase();
          const resultsContainer = document.getElementById("live-search-results");
          if (!resultsContainer) return;
          if (q.length < 2) {
            resultsContainer.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.85rem;padding:8px 0;">Type at least 2 characters to explore...</p>`;
            return;
          }
          const products = await API.getProducts();
          const matches = products.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
          if (!matches.length) {
            resultsContainer.innerHTML = `<p style="color:var(--text-secondary);font-size:0.88rem;padding:12px 0;">No matching objects found for "${App.escape(q)}".</p>`;
            return;
          }
          resultsContainer.innerHTML = matches.slice(0, 5).map((p) => `
            <a class="search-result-item" href="product.html?id=${encodeURIComponent(p.id)}">
              <div class="search-result-thumb">
                <img src="${App.escape(p.image)}" alt="" data-fallback>
              </div>
              <div class="search-result-info">
                <strong>${App.escape(p.name)}</strong>
                <span>${App.escape(p.category)} · ${p.stock > 0 ? "In Stock" : "Out of Stock"}</span>
              </div>
              <span class="search-result-price">${App.formatPrice(p.price)}</span>
            </a>
          `).join("");
          App.bindImageFallback(resultsContainer);
        }, 180);
      }
    });

    // Newsletter submit
    document.addEventListener("submit", (event) => {
      if (event.target.id === "newsletter-form") {
        event.preventDefault();
        const email = document.getElementById("newsletter-email").value.trim();
        const error = document.getElementById("newsletter-error");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (error) error.textContent = "Please provide a valid client email address.";
          return;
        }
        if (error) error.textContent = "";
        event.target.reset();
        App.toast("Subscribed to CloudCart VIP Dispatch.");
      }
    });
  },

  async initHome() {
    const featured = document.getElementById("featured-grid");
    const heroMedia = document.getElementById("hero-media");
    if (!featured) return;

    featured.innerHTML = `<div class="skeleton-grid" style="grid-column:1/-1">${"<div class='skeleton-card'></div>".repeat(4)}</div>`;

    try {
      const products = await API.getProducts();
      const selected = products.filter((p) => p.featured).slice(0, 4);
      featured.innerHTML = selected.map(App.productCard).join("");
      App.bindImageFallback(featured);
      App.refreshIcons();

      // Hero dynamic showcase switchers
      const switchers = document.querySelectorAll("[data-hero-product]");
      const heroPrice = document.getElementById("hero-price");
      const heroName = document.getElementById("hero-name");
      const heroImg = document.getElementById("hero-img");
      const heroLink = document.getElementById("hero-product-link");

      switchers.forEach((btn) => {
        btn.addEventListener("click", () => {
          switchers.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const prodId = btn.getAttribute("data-hero-product");
          const prod = products.find((p) => p.id === prodId);
          if (prod && heroImg && heroName && heroPrice) {
            heroImg.style.opacity = "0.3";
            setTimeout(() => {
              heroImg.src = prod.image;
              heroImg.alt = prod.name;
              heroName.textContent = prod.name;
              heroPrice.textContent = App.formatPrice(prod.price);
              if (heroLink) heroLink.href = `product.html?id=${encodeURIComponent(prod.id)}`;
              heroImg.style.opacity = "1";
            }, 150);
          }
        });
      });
    } catch (err) {
      featured.innerHTML = `<div class="field-error">Unable to load featured objects: ${App.escape(err.message)}</div>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.renderChrome();
  App.bindGlobalEvents();
  if (document.body.dataset.page === "home") App.initHome();
});
