/**
 * CloudCart — Products Catalog Controller
 * Real-time filtering, search debouncing, layout toggle & sorting
 */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("product-grid");
  const search = document.getElementById("product-search");
  const searchClear = document.getElementById("search-clear");
  const sort = document.getElementById("product-sort");
  const filters = document.getElementById("category-filters");
  const resultsCount = document.getElementById("results-count");
  const viewGrid = document.getElementById("view-grid");
  const viewList = document.getElementById("view-list");

  if (!grid) return;

  const params = new URLSearchParams(location.search);
  let query = (params.get("q") || "").trim();
  let category = params.get("category") || "All";
  let onlyNew = params.get("filter") === "new";
  let under3k = false;
  let inStockOnly = false;
  let currentLayout = "grid";
  let allProducts = [];

  if (search && query) {
    search.value = query;
    if (searchClear) searchClear.classList.add("is-active");
  }

  const showSkeletons = () => {
    grid.innerHTML = `<div class="skeleton-grid" style="grid-column:1/-1">${"<div class='skeleton-card'></div>".repeat(8)}</div>`;
  };

  const renderFilters = (products) => {
    if (!filters) return;
    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

    const categoryChips = categories.map((cat) => `
      <button type="button" class="filter-chip ${cat === category && !onlyNew && !under3k && !inStockOnly ? "active" : ""}" data-category="${App.escape(cat)}" aria-pressed="${cat === category}">
        ${App.escape(cat)}
      </button>
    `).join("");

    const quickChips = `
      <button type="button" class="filter-chip ${onlyNew ? "active" : ""}" data-quick-filter="new">
        ⚡ New Arrivals
      </button>
      <button type="button" class="filter-chip ${under3k ? "active" : ""}" data-quick-filter="under3k">
        ₹ Under 3,000
      </button>
      <button type="button" class="filter-chip ${inStockOnly ? "active" : ""}" data-quick-filter="inStock">
        ✓ In Stock Only
      </button>
    `;

    filters.innerHTML = categoryChips + quickChips;
  };

  const applyFilters = () => {
    let list = allProducts.slice();
    const q = (search ? search.value : query).trim().toLowerCase();

    if (searchClear) {
      searchClear.classList.toggle("is-active", Boolean(q));
    }

    // Keyword search
    if (q) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }

    // Quick filters
    if (onlyNew) {
      list = list.filter((p) => p.newArrival);
    }
    if (under3k) {
      list = list.filter((p) => p.price <= 3000);
    }
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort order
    const mode = sort ? sort.value : "featured";
    if (mode === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (mode === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (mode === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
    }

    // Update Counter
    if (resultsCount) {
      resultsCount.textContent = `Showing ${list.length} of ${allProducts.length} objects`;
    }

    if (!list.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:64px 20px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-xl);">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:var(--text-tertiary);display:grid;place-items:center;margin:0 auto 16px;">
            <i data-lucide="search-x"></i>
          </div>
          <h3 style="font-size:1.4rem;margin-bottom:8px;">No Matching Objects</h3>
          <p style="color:var(--text-secondary);font-size:0.95rem;max-width:440px;margin:0 auto 24px;">We couldn't find hardware matching your selected criteria. Try resetting filters or modifying your search query.</p>
          <button class="btn btn--primary" type="button" id="reset-catalog-filters">
            <i data-lucide="rotate-ccw"></i> Reset All Filters
          </button>
        </div>`;
      App.refreshIcons();
      const resetBtn = document.getElementById("reset-catalog-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          category = "All";
          onlyNew = false;
          under3k = false;
          inStockOnly = false;
          if (search) search.value = "";
          if (sort) sort.value = "featured";
          renderFilters(allProducts);
          applyFilters();
        });
      }
      return;
    }

    grid.innerHTML = list.map(App.productCard).join("");
    App.bindImageFallback(grid);
    App.refreshIcons();
  };

  showSkeletons();
  try {
    allProducts = await API.getProducts();
    renderFilters(allProducts);
    applyFilters();
  } catch (err) {
    grid.innerHTML = `<div class="field-error" style="grid-column:1/-1;">Could not load catalogue: ${App.escape(err.message)}</div>`;
  }

  // Search input events
  if (search) {
    search.addEventListener("input", () => {
      applyFilters();
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (search) search.value = "";
      applyFilters();
    });
  }

  // Sort change event
  if (sort) {
    sort.addEventListener("change", applyFilters);
  }

  // Filter chips click handling
  if (filters) {
    filters.addEventListener("click", (event) => {
      const catChip = event.target.closest("[data-category]");
      if (catChip) {
        category = catChip.getAttribute("data-category");
        onlyNew = false;
        under3k = false;
        inStockOnly = false;
        renderFilters(allProducts);
        applyFilters();
        return;
      }

      const quickChip = event.target.closest("[data-quick-filter]");
      if (quickChip) {
        const type = quickChip.getAttribute("data-quick-filter");
        if (type === "new") onlyNew = !onlyNew;
        if (type === "under3k") under3k = !under3k;
        if (type === "inStock") inStockOnly = !inStockOnly;
        renderFilters(allProducts);
        applyFilters();
      }
    });
  }

  // View mode switcher
  if (viewGrid && viewList) {
    viewGrid.addEventListener("click", () => {
      currentLayout = "grid";
      viewGrid.classList.add("active");
      viewList.classList.remove("active");
      grid.classList.remove("product-grid--list");
    });

    viewList.addEventListener("click", () => {
      currentLayout = "list";
      viewList.classList.add("active");
      viewGrid.classList.remove("active");
      grid.classList.add("product-grid--list");
    });
  }
});
