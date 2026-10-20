/**
 * CloudCart — Admin Console Controller
 * Metrics calculation, instant stock adjusters, catalog CRUD & order stream
 */

document.addEventListener("DOMContentLoaded", async () => {
  const stats = document.getElementById("admin-stats");
  const tableBody = document.getElementById("inventory-body");
  const form = document.getElementById("product-form");
  const ordersEl = document.getElementById("recent-orders");
  const searchInput = document.getElementById("admin-search");
  const tableCount = document.getElementById("admin-table-count");
  const resetDemoBtn = document.getElementById("btn-reset-demo");

  if (!stats || !tableBody || !form) return;

  const fields = {
    id: document.getElementById("field-id"),
    name: document.getElementById("field-name"),
    tagline: document.getElementById("field-tagline"),
    price: document.getElementById("field-price"),
    category: document.getElementById("field-category"),
    image: document.getElementById("field-image"),
    stock: document.getElementById("field-stock"),
    description: document.getElementById("field-desc"),
    original: document.getElementById("field-original-id"),
  };

  const formImgPreview = document.getElementById("form-img-preview");
  const formPreviewImg = document.getElementById("form-preview-img");
  const formError = document.getElementById("form-error");
  const formTitle = document.getElementById("form-title");
  const resetBtn = document.getElementById("reset-form");

  let cachedProducts = [];

  // Live image preview
  if (fields.image && formImgPreview && formPreviewImg) {
    fields.image.addEventListener("input", () => {
      const url = fields.image.value.trim();
      if (/^https?:\/\//i.test(url)) {
        formPreviewImg.src = url;
        formImgPreview.style.display = "flex";
      } else {
        formImgPreview.style.display = "none";
      }
    });
  }

  const resetForm = () => {
    form.reset();
    fields.original.value = "";
    formTitle.textContent = "Add New Hardware Object";
    formError.textContent = "";
    if (formImgPreview) formImgPreview.style.display = "none";
  };

  const validate = () => {
    const name = fields.name.value.trim();
    const price = Number(fields.price.value);
    const category = fields.category.value.trim();
    const stock = Number(fields.stock.value);
    const image = fields.image.value.trim();

    if (name.length < 2) return "Enter a valid product name.";
    if (!Number.isFinite(price) || price <= 0) return "Enter an INR price greater than 0.";
    if (!category) return "Select a product category.";
    if (!Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative whole number.";
    if (image && !/^https?:\/\//i.test(image)) return "Image URL must start with http:// or https://";
    return "";
  };

  const renderStats = (products, orders) => {
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= CONFIG.lowStockAt).length;

    stats.innerHTML = `
      <article class="admin-stat-card">
        <div class="stat-header">
          <span>Inventory Value</span>
          <i data-lucide="wallet" style="color:var(--neon);"></i>
        </div>
        <strong>${App.formatPrice(totalInventoryValue)}</strong>
        <span class="stat-trend"><i data-lucide="trending-up"></i> +14.2% YoY</span>
      </article>

      <article class="admin-stat-card">
        <div class="stat-header">
          <span>Active Hardware SKUs</span>
          <i data-lucide="layers" style="color:var(--cyan);"></i>
        </div>
        <strong>${products.length}</strong>
        <span class="stat-trend" style="color:var(--cyan);"><i data-lucide="check"></i> 100% In System</span>
      </article>

      <article class="admin-stat-card">
        <div class="stat-header">
          <span>Orders Processed</span>
          <i data-lucide="shopping-cart"></i>
        </div>
        <strong>${orders.length}</strong>
        <span class="stat-trend"><i data-lucide="activity"></i> Serverless Logs</span>
      </article>

      <article class="admin-stat-card">
        <div class="stat-header">
          <span>Low Stock Warnings</span>
          <i data-lucide="alert-triangle" style="color:${lowStockCount ? "var(--warning)" : "var(--neon)"};"></i>
        </div>
        <strong style="color:${lowStockCount ? "var(--warning)" : "var(--text-primary)"};">${lowStockCount}</strong>
        <span class="stat-trend" style="color:${lowStockCount ? "var(--warning)" : "var(--neon)"};">Threshold ≤ ${CONFIG.lowStockAt} units</span>
      </article>`;

    App.refreshIcons();
  };

  const renderTable = (products) => {
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const filtered = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      : products;

    if (tableCount) {
      tableCount.textContent = `${filtered.length} of ${products.length} SKUs registered`;
    }

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-tertiary);">No matching inventory objects found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered
      .map((p) => {
        const stock = App.stockLabel(p.stock);
        const thumb = p.image
          ? `<div class="thumb-preview"><img src="${App.escape(p.image)}" alt="" data-fallback></div>`
          : `<div class="thumb-preview"></div>`;

        return `
          <tr data-id="${App.escape(p.id)}">
            <td>
              <div style="display:flex;align-items:center;gap:12px;">
                ${thumb}
                <div>
                  <strong style="display:block;font-size:0.92rem;"><a href="product.html?id=${encodeURIComponent(p.id)}" target="_blank">${App.escape(p.name)}</a></strong>
                  <span style="font-size:0.72rem;color:var(--text-tertiary);font-family:var(--font-mono);">${App.escape(p.id)}</span>
                </div>
              </div>
            </td>
            <td><span style="font-size:0.82rem;color:var(--text-secondary);">${App.escape(p.category)}</span></td>
            <td><span style="font-family:var(--font-mono);font-weight:700;">${App.formatPrice(p.price)}</span></td>
            <td><span style="font-family:var(--font-mono);font-weight:700;">${p.stock}</span></td>
            <td><span class="${stock.cls}"><span class="dot"></span> ${stock.text}</span></td>
            <td>
              <div class="stock-stepper-mini">
                <button type="button" data-stock-adjust="-1" title="Decrease stock by 1">−</button>
                <button type="button" data-stock-adjust="5" title="Add 5 units">+5</button>
              </div>
            </td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--ghost btn--small" type="button" data-edit style="height:32px;padding:0 10px;">Edit</button>
                <button class="btn btn--danger btn--small" type="button" data-delete style="height:32px;padding:0 10px;">Delete</button>
              </div>
            </td>
          </tr>`;
      })
      .join("");

    App.bindImageFallback(tableBody);
  };

  const renderOrders = (orders, products) => {
    if (!ordersEl) return;
    if (!orders.length) {
      ordersEl.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.85rem;">No orders recorded yet.</p>`;
      return;
    }

    ordersEl.innerHTML = orders
      .slice(0, 6)
      .map((order) => {
        const count = (order.items || []).reduce((s, i) => s + Number(i.quantity || 0), 0);
        const names = (order.items || [])
          .map((i) => products.find((p) => p.id === i.productId)?.name || i.productId)
          .join(", ");
        const customerName = order.customer?.name || "Client";
        const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        return `
          <article class="order-card-compact">
            <div class="top-line">
              <span style="color:var(--neon);">${App.escape(order.id)}</span>
              <span class="status-tag">${App.escape(order.status || "Confirmed")}</span>
            </div>
            <div style="font-size:0.82rem;color:var(--text-secondary);">
              <strong>${App.escape(customerName)}</strong> · ${count} item${count === 1 ? "" : "s"} · <span style="color:var(--text-primary);font-family:var(--font-mono);">${App.formatPrice(order.total)}</span>
            </div>
            <div style="font-size:0.74rem;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${App.escape(names)}
            </div>
            <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">
              ${dateStr}
            </div>
          </article>`;
      })
      .join("");
  };

  const refresh = async () => {
    try {
      const [products, orders] = await Promise.all([
        API.getProducts(),
        API.getOrders(),
      ]);
      cachedProducts = products;
      renderStats(products, orders);
      renderTable(products);
      renderOrders(orders, products);
      await renderAiInsights(products, orders);
    } catch (err) {
      App.toast(err.message, "error");
    }
  };

  const renderAiInsights = async (products, orders) => {
    const healthEl = document.getElementById("ai-health-pct");
    const summaryEl = document.getElementById("ai-exec-summary");
    const chipsEl = document.getElementById("ai-restock-chips");
    if (!summaryEl || !chipsEl) return;

    try {
      const insights = await API.getAiInsights({ type: "admin", orders });
      if (!insights) return;

      if (healthEl) {
        healthEl.textContent = `${insights.inventoryHealthPct}%`;
        healthEl.style.color = insights.inventoryHealthPct > 80 ? "var(--neon)" : "var(--warning)";
      }

      if (summaryEl) {
        summaryEl.innerHTML = `<strong>Aether Diagnosis:</strong> ${App.escape(insights.executiveSummary)}`;
      }

      if (chipsEl && Array.isArray(insights.restockUrgencyList)) {
        if (!insights.restockUrgencyList.length) {
          chipsEl.innerHTML = `<span style="font-size:0.8rem;color:var(--text-tertiary);">Zero immediate restock alerts. All 60 SKUs are nominal.</span>`;
        } else {
          chipsEl.innerHTML = insights.restockUrgencyList.map((item) => `
            <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--radius-md);padding:8px 12px;display:flex;align-items:center;gap:10px;font-size:0.82rem;">
              <span class="product-badge ${item.urgency === 'CRITICAL' ? 'product-badge--out' : 'product-badge--low'}">${item.urgency}</span>
              <div>
                <strong style="color:var(--text-primary);display:block;font-size:0.85rem;">${App.escape(item.name)}</strong>
                <span style="font-size:0.72rem;color:var(--text-secondary);font-family:var(--font-mono);">Stock: ${item.stock} · Velocity: ${item.demandScore}</span>
              </div>
              <button class="btn btn--cyan btn--small" type="button" data-ai-restock="${App.escape(item.id)}" data-units="${item.suggestedReorderUnits}" style="height:28px;padding:0 8px;font-size:0.72rem;margin-left:auto;">
                +${item.suggestedReorderUnits} Units
              </button>
            </div>
          `).join("");
        }
      }
      App.refreshIcons();
    } catch (e) {
      console.warn("AI insights load error", e);
    }
  };

  // Stock quick adjustment or row edit/delete delegation
  tableBody.addEventListener("click", async (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const id = row.getAttribute("data-id");
    const product = cachedProducts.find((p) => p.id === id);
    if (!product) return;

    // Quick stock adjust buttons
    const adjustBtn = event.target.closest("[data-stock-adjust]");
    if (adjustBtn) {
      const delta = Number(adjustBtn.getAttribute("data-stock-adjust"));
      const newStock = Math.max(0, product.stock + delta);
      try {
        await API.updateProductStock(id, newStock);
        App.toast(`Stock for "${product.name}" updated to ${newStock}`);
        await refresh();
      } catch (err) {
        App.toast(err.message, "error");
      }
      return;
    }

    // Edit button
    if (event.target.closest("[data-edit]")) {
      fields.original.value = product.id;
      fields.id.value = product.id;
      fields.name.value = product.name;
      fields.tagline.value = product.tagline || "";
      fields.price.value = product.price;
      fields.category.value = product.category;
      fields.image.value = product.image || "";
      fields.stock.value = product.stock;
      fields.description.value = product.description || "";
      formTitle.textContent = `Edit Hardware Object`;
      if (product.image && formImgPreview && formPreviewImg) {
        formPreviewImg.src = product.image;
        formImgPreview.style.display = "flex";
      }
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Delete button
    if (event.target.closest("[data-delete]")) {
      if (!confirm(`Are you sure you want to remove "${product.name}" from catalogue?`)) return;
      try {
        await API.deleteProduct(id);
        App.toast(`Deleted "${product.name}"`);
        resetForm();
        await refresh();
      } catch (err) {
        App.toast(err.message, "error");
      }
    }
  });

  // Table search input
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderTable(cachedProducts);
    });
  }

  // Handle AI Restock 1-click execution
  document.addEventListener("click", async (event) => {
    const aiBtn = event.target.closest("[data-ai-restock]");
    if (aiBtn) {
      const id = aiBtn.getAttribute("data-ai-restock");
      const units = Number(aiBtn.getAttribute("data-units")) || 15;
      const product = cachedProducts.find((p) => p.id === id);
      if (product) {
        aiBtn.disabled = true;
        aiBtn.innerHTML = `<i data-lucide="loader"></i> Restocking...`;
        App.refreshIcons();
        try {
          const nextStock = product.stock + units;
          await API.updateProductStock(id, nextStock);
          App.toast(`Restocked +${units} units for ${product.name}`);
          await refresh();
        } catch (err) {
          App.toast(err.message, "error");
        }
      }
    }
  });

  // Form submit
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      formError.textContent = error;
      return;
    }
    formError.textContent = "";

    const payload = {
      id: fields.id.value.trim() || `prod-${Date.now().toString(36).slice(-4)}`,
      name: fields.name.value.trim(),
      tagline: fields.tagline.value.trim(),
      price: Number(fields.price.value),
      category: fields.category.value.trim(),
      image: fields.image.value.trim(),
      stock: Number(fields.stock.value),
      description: fields.description.value.trim(),
    };

    try {
      await API.saveProduct(payload, fields.original.value || undefined);
      App.toast(`Saved object "${payload.name}"`);
      resetForm();
      await refresh();
    } catch (err) {
      formError.textContent = err.message;
    }
  });

  if (resetBtn) resetBtn.addEventListener("click", resetForm);

  // Restore sample demo data button
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", async () => {
      if (!confirm("Reset demo data to initial 10 objects and sample orders?")) return;
      DemoStore.resetDemoData();
      App.toast("Demo data successfully restored");
      resetForm();
      await refresh();
    });
  }

  await refresh();
});
