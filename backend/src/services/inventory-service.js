import { publicProduct } from "./product-service.js";

const LOW_STOCK_AT = 5;

export function createInventoryService(store, config) {
  return {
    async list() {
      const products = (await store.listAllProducts(config.maxCatalogueItems))
        .map(publicProduct)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((product) => ({
          ...product,
          stockStatus:
            product.stock <= 0 ? "OUT_OF_STOCK" : product.stock <= LOW_STOCK_AT ? "LOW_STOCK" : "IN_STOCK",
        }));

      return {
        products,
        totals: {
          products: products.length,
          outOfStock: products.filter((item) => item.stockStatus === "OUT_OF_STOCK").length,
          lowStock: products.filter((item) => item.stockStatus === "LOW_STOCK").length,
        },
      };
    },

    async setStock(productId, stock) {
      const updated = await store.updateProductStock(productId, stock);
      return publicProduct(updated);
    },
  };
}
