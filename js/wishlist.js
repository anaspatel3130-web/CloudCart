/**
 * CloudCart — Studio Wishlist Controller
 * Manages user's saved hardware items, real-time stock sync, and bulk bag migration.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderWishlist();

  window.addEventListener("wishlist:updated", () => {
    renderWishlist();
  });

  const moveAllBtn = document.getElementById("btn-move-all-bag");
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", async () => {
      moveAllBtn.disabled = true;
      const prev = moveAllBtn.innerHTML;
      moveAllBtn.innerHTML = `<i data-lucide="loader"></i> Migrating...`;
      App.refreshIcons();

      try {
        const items = await API.getWishlist();
        if (!items.length) {
          App.toast("Wishlist is already empty", "error");
          moveAllBtn.innerHTML = prev;
          moveAllBtn.disabled = false;
          App.refreshIcons();
          return;
        }

        let addedCount = 0;
        for (const item of items) {
          if (item.stock > 0) {
            await API.addToCart(item.id, 1);
            addedCount++;
          }
        }

        // Clear wishlist after migration
        DemoStore.write(CONFIG.storage.wishlist, []);
        App.updateWishlistBadge();
        await App.updateCartBadge();
        App.toast(`Transferred ${addedCount} items to your shopping bag`);
        renderWishlist();
      } catch (err) {
        App.toast(err.message, "error");
      } finally {
        moveAllBtn.innerHTML = prev;
        moveAllBtn.disabled = false;
        App.refreshIcons();
      }
    });
  }

  const clearBtn = document.getElementById("btn-clear-wishlist");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      DemoStore.write(CONFIG.storage.wishlist, []);
      App.updateWishlistBadge();
      App.toast("Wishlist cleared");
      renderWishlist();
    });
  }
});

async function renderWishlist() {
  const container = document.getElementById("wishlist-container");
  const toolbarActions = document.getElementById("wishlist-toolbar-actions");
  if (!container) return;

  try {
    const items = await API.getWishlist();

    if (!items || items.length === 0) {
      if (toolbarActions) toolbarActions.style.display = "none";
      container.innerHTML = `
        <div style="text-align:center;padding:80px 20px;background:rgba(255,255,255,0.015);border:1px dashed var(--border);border-radius:var(--radius-xl);max-width:640px;margin:30px auto;">
          <div style="width:68px;height:68px;border-radius:50%;background:rgba(255,59,105,0.08);border:1px solid rgba(255,59,105,0.3);color:#ff3b69;display:grid;place-items:center;margin:0 auto 20px;">
            <i data-lucide="heart" style="width:30px;height:30px;"></i>
          </div>
          <h2 style="font-size:1.8rem;margin-bottom:12px;font-family:var(--font-heading);">Your Studio Wishlist is Empty</h2>
          <p style="color:var(--text-secondary);font-size:0.95rem;line-height:1.6;margin-bottom:28px;">
            Save pieces from the collection while exploring acoustics, neural wearables, and workspace ergonomics to track inventory changes and reserve hardware.
          </p>
          <a class="btn btn--primary" href="products.html">
            Explore 60 Hardware Objects <i data-lucide="arrow-right"></i>
          </a>
        </div>`;
      App.refreshIcons();
      return;
    }

    if (toolbarActions) toolbarActions.style.display = "flex";

    container.innerHTML = `
      <div style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);">
          SHOWING <strong style="color:var(--text-primary);">${items.length}</strong> SAVED OBJECTS
        </span>
      </div>
      <div class="product-grid" id="wishlist-grid">
        ${items.map(App.productCard).join("")}
      </div>`;

    App.bindImageFallback(container);
    App.refreshIcons();
  } catch (err) {
    container.innerHTML = `
      <div class="field-error" style="text-align:center;padding:40px;">
        Failed to load wishlist: ${App.escape(err.message)}
      </div>`;
  }
}
