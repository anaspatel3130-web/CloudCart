/**
 * CloudCart — Product Details Page Controller
 * Cinematic image viewer, interactive specs tabs, quantity stepper & instant checkout
 */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("product-details-container");
  const crumbCat = document.getElementById("crumb-cat");
  const crumbName = document.getElementById("crumb-name");
  const relatedGrid = document.getElementById("related-grid");

  if (!container) return;

  const params = new URLSearchParams(location.search);
  const productId = params.get("id") || "prod-001";
  let quantity = 1;

  try {
    const product = await API.getProduct(productId);
    if (!product) throw new Error("Product object could not be found.");

    document.title = `${product.name} — CloudCart Studio`;
    if (crumbCat) crumbCat.textContent = product.category;
    if (crumbName) crumbName.textContent = product.name;

    const stock = App.stockLabel(product.stock);
    const isOut = product.stock <= 0;
    const discount = product.previousPrice && product.previousPrice > product.price
      ? Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100)
      : null;

    const galleryImages = (product.gallery && product.gallery.length)
      ? product.gallery
      : [product.image];

    // Build specs rows
    const specsRows = Object.entries(product.specs || {}).map(([key, val]) => `
      <tr>
        <th>${App.escape(key)}</th>
        <td>${App.escape(val)}</td>
      </tr>
    `).join("");

    // Build highlights items
    const highlightsItems = (product.highlights || []).map((h) => `
      <div class="feature-bullet-item">
        <i data-lucide="check-circle-2"></i>
        <span>${App.escape(h)}</span>
      </div>
    `).join("");

    // Thumbnails markup
    const thumbsMarkup = galleryImages.map((url, idx) => `
      <div class="gallery-thumb ${idx === 0 ? "active" : ""}" data-index="${idx}">
        <img src="${App.escape(url)}" alt="" data-fallback>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="product-details-layout">
        <!-- Visual Gallery Column -->
        <div class="product-gallery">
          <div class="gallery-main" id="gallery-main-frame">
            <img id="gallery-main-img" src="${App.escape(galleryImages[0])}" alt="${App.escape(product.name)}" data-fallback>
          </div>
          ${galleryImages.length > 1 ? `<div class="gallery-thumbs" id="gallery-thumbs-row">${thumbsMarkup}</div>` : ""}
        </div>

        <!-- Specifications & Purchase Column -->
        <div class="product-info">
          <span class="product-info__cat">${App.escape(product.category)}</span>
          <h1 class="product-info__title">${App.escape(product.name)}</h1>
          
          <div class="product-info__rating">
            <div class="rating-stars">
              ${'<i data-lucide="star"></i>'.repeat(5)}
            </div>
            <span><strong>${product.rating || "4.9"}</strong> / 5.0 (${product.reviewsCount || 128} Studio Verified Reviews)</span>
          </div>

          <div class="product-info__price-box">
            <span class="price">${App.formatPrice(product.price)}</span>
            ${product.previousPrice ? `<span class="price--old">${App.formatPrice(product.previousPrice)}</span>` : ""}
            ${discount ? `<span class="discount-tag">Save ${discount}%</span>` : ""}
          </div>

          <p class="product-info__tagline">${App.escape(product.tagline || "")}</p>
          <p class="product-info__desc">${App.escape(product.description)}</p>

          <div class="feature-bullets">
            ${highlightsItems}
          </div>

          <div style="margin-bottom: 24px;">
            <span class="${stock.cls}"><span class="dot"></span> ${stock.text}</span>
          </div>

          <!-- Quantity Stepper & Actions -->
          <div class="purchase-row">
            <div class="qty-stepper" role="group" aria-label="Quantity for ${App.escape(product.name)}">
              <button class="qty-btn" id="qty-dec" type="button" aria-label="Decrease quantity" ${isOut ? "disabled" : ""}>−</button>
              <span id="qty-value">${quantity}</span>
              <button class="qty-btn" id="qty-inc" type="button" aria-label="Increase quantity" ${isOut ? "disabled" : ""}>+</button>
            </div>

            <button class="btn btn--primary" id="btn-add-bag" type="button" ${isOut ? "disabled" : ""} style="flex:1;">
              <i data-lucide="shopping-bag"></i> ${isOut ? "Sold Out" : "Add to Bag"}
            </button>

            <button class="btn btn--cyan" id="btn-buy-now" type="button" ${isOut ? "disabled" : ""} style="flex:1;">
              <i data-lucide="zap"></i> Buy Now
            </button>

            <button class="btn btn--ghost" id="btn-wishlist-toggle" type="button" aria-label="Save to Wishlist" style="width:48px;padding:0;display:grid;place-items:center;">
              <i data-lucide="heart" id="wishlist-icon" style="${API.isInWishlist(product.id) ? "fill:#ff3b69;color:#ff3b69;" : ""}"></i>
            </button>
          </div>

          <!-- Trust Signals -->
          <div class="trust-signals-row">
            <div class="trust-signal">
              <i data-lucide="truck"></i>
              <span>Complimentary Express Air Shipping</span>
            </div>
            <div class="trust-signal">
              <i data-lucide="rotate-ccw"></i>
              <span>30-Day Studio Trial</span>
            </div>
            <div class="trust-signal">
              <i data-lucide="shield-check"></i>
              <span>2-Year CloudCart Warranty</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Tabs -->
      <section class="product-tabs">
        <div class="tabs-header">
          <button class="tab-btn active" type="button" data-tab="tab-overview">Overview & Design</button>
          <button class="tab-btn" type="button" data-tab="tab-specs">Technical Specifications</button>
          <button class="tab-btn" type="button" data-tab="tab-shipping">Shipping & Cloud Guarantee</button>
        </div>

        <div class="tab-content active" id="tab-overview">
          <h3 style="margin-bottom:14px;font-size:1.35rem;">Designed Without Compromise</h3>
          <p style="color:var(--text-secondary);font-size:1rem;line-height:1.7;margin-bottom:24px;">
            Every detail of the ${App.escape(product.name)} is tailored for tactile precision and acoustic clarity.
            From calibrated tolerances to sustainably finished surfaces, this object balances quiet elegance with uncompromising performance in any modern workspace.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
            <div style="background:rgba(255,255,255,0.02);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);">
              <strong style="display:block;margin-bottom:6px;font-size:0.95rem;">In the Box</strong>
              <p style="color:var(--text-secondary);font-size:0.85rem;">1x ${App.escape(product.name)}, braided USB-C charging cable, studio quickstart field manual, certificate of authenticity.</p>
            </div>
            <div style="background:rgba(255,255,255,0.02);padding:20px;border-radius:var(--radius-md);border:1px solid var(--border);">
              <strong style="display:block;margin-bottom:6px;font-size:0.95rem;">Material Integrity</strong>
              <p style="color:var(--text-secondary);font-size:0.85rem;">Constructed with 100% recyclable post-consumer alloys and low-friction friction-welded joints.</p>
            </div>
          </div>
        </div>

        <div class="tab-content" id="tab-specs">
          <h3 style="margin-bottom:18px;font-size:1.35rem;">Technical Parameters</h3>
          <table class="specs-table">
            <tbody>
              ${specsRows}
            </tbody>
          </table>
        </div>

        <div class="tab-content" id="tab-shipping">
          <h3 style="margin-bottom:14px;font-size:1.35rem;">Logistics & Assurance</h3>
          <p style="color:var(--text-secondary);font-size:0.95rem;line-height:1.7;margin-bottom:16px;">
            All hardware orders are verified atomically and dispatched within 24 hours from our regional fulfillment centers.
            Tracking numbers are issued immediately upon packaging.
          </p>
          <ul style="color:var(--text-secondary);font-size:0.9rem;display:grid;gap:10px;">
            <li>✓ Free Express Delivery across India (estimated 2–4 business days).</li>
            <li>✓ Hassle-free 30-day return policy in original packaging.</li>
            <li>✓ 24-month comprehensive hardware warranty coverage.</li>
          </ul>
        </div>
      </section>`;

    App.bindImageFallback(container);
    App.refreshIcons();

    // Gallery thumbnail switcher
    const thumbs = document.querySelectorAll(".gallery-thumb");
    const mainImg = document.getElementById("gallery-main-img");
    thumbs.forEach((t) => {
      t.addEventListener("click", () => {
        thumbs.forEach((b) => b.classList.remove("active"));
        t.classList.add("active");
        const idx = Number(t.getAttribute("data-index"));
        if (mainImg && galleryImages[idx]) {
          mainImg.style.opacity = "0.4";
          setTimeout(() => {
            mainImg.src = galleryImages[idx];
            mainImg.style.opacity = "1";
          }, 120);
        }
      });
    });

    // Quantity Stepper controls
    const qtyVal = document.getElementById("qty-value");
    const qtyInc = document.getElementById("qty-inc");
    const qtyDec = document.getElementById("qty-dec");

    if (qtyInc && qtyDec && qtyVal) {
      qtyInc.addEventListener("click", () => {
        if (quantity < product.stock) {
          quantity++;
          qtyVal.textContent = String(quantity);
        } else {
          App.toast(`Maximum available stock is ${product.stock}`, "error");
        }
      });

      qtyDec.addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          qtyVal.textContent = String(quantity);
        }
      });
    }

    // Add to Bag action
    const addBagBtn = document.getElementById("btn-add-bag");
    if (addBagBtn) {
      addBagBtn.addEventListener("click", async () => {
        addBagBtn.disabled = true;
        const origText = addBagBtn.innerHTML;
        addBagBtn.innerHTML = `<i data-lucide="loader"></i> Adding...`;
        App.refreshIcons();
        try {
          await API.addToCart(product.id, quantity);
          await App.updateCartBadge();
          App.toast(`Added ${quantity} × ${product.name} to your bag`);
          addBagBtn.innerHTML = `<i data-lucide="check"></i> Added ✓`;
          setTimeout(() => {
            addBagBtn.innerHTML = origText;
            addBagBtn.disabled = false;
            App.refreshIcons();
          }, 1200);
        } catch (err) {
          App.toast(err.message, "error");
          addBagBtn.innerHTML = origText;
          addBagBtn.disabled = false;
          App.refreshIcons();
        }
      });
    }

    // Buy Now action
    const buyNowBtn = document.getElementById("btn-buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", async () => {
        buyNowBtn.disabled = true;
        buyNowBtn.innerHTML = `<i data-lucide="loader"></i> Directing...`;
        App.refreshIcons();
        try {
          await API.addToCart(product.id, quantity);
          await App.updateCartBadge();
          location.href = "checkout.html";
        } catch (err) {
          App.toast(err.message, "error");
          buyNowBtn.disabled = false;
          buyNowBtn.innerHTML = `<i data-lucide="zap"></i> Buy Now`;
          App.refreshIcons();
        }
      });
    }

    // Tab buttons switcher
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        const target = document.getElementById(targetId);
        if (target) target.classList.add("active");
      });
    });

    // Wishlist Toggle
    const wishlistToggleBtn = document.getElementById("btn-wishlist-toggle");
    const wishlistIcon = document.getElementById("wishlist-icon");
    if (wishlistToggleBtn && wishlistIcon) {
      wishlistToggleBtn.addEventListener("click", async () => {
        const { isWishlisted } = await API.toggleWishlist(product.id);
        wishlistIcon.style.fill = isWishlisted ? "#ff3b69" : "none";
        wishlistIcon.style.color = isWishlisted ? "#ff3b69" : "currentColor";
        App.updateWishlistBadge();
        App.toast(isWishlisted ? "Saved to your studio wishlist" : "Removed from wishlist");
      });
    }

    // Populate Related Hardware Grid
    if (relatedGrid) {
      const all = await API.getProducts();
      const related = all.filter((p) => p.id !== product.id).slice(0, 4);
      relatedGrid.innerHTML = related.map(App.productCard).join("");
      App.bindImageFallback(relatedGrid);
      App.refreshIcons();
    }
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 20px;">
        <h2 style="font-size:1.8rem;margin-bottom:12px;">Object Not Found</h2>
        <p style="color:var(--text-secondary);margin-bottom:24px;">${App.escape(err.message)}</p>
        <a class="btn btn--primary" href="products.html">Return to Collection</a>
      </div>`;
  }
});
