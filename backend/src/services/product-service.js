import { Errors } from "../lib/errors.js";
import { decodeCursor, encodeCursor } from "../lib/validation.js";

export function publicProduct(item) {
  if (!item || typeof item !== "object") return null;
  const price = Number(item.price);
  const stock = Number(item.stock);
  if (!item.id || !item.name || !Number.isFinite(price)) return null;
  const previousPrice = Number(item.previousPrice);
  return {
    id: String(item.id),
    name: String(item.name),
    description: String(item.description || ""),
    price,
    category: String(item.category || "Uncategorised"),
    image: item.image ? String(item.image) : "",
    stock: Number.isInteger(stock) && stock >= 0 ? stock : 0,
    createdAt: item.createdAt ? String(item.createdAt) : null,
    previousPrice: Number.isFinite(previousPrice) && previousPrice > price ? previousPrice : null,
    featured: Boolean(item.featured),
    newArrival: Boolean(item.newArrival),
  };
}

export function createProductService(store, config) {
  return {
    async list({ category, search, limit, cursor } = {}) {
      const all = (await store.listAllProducts(config.maxCatalogueItems))
        .map(publicProduct)
        .filter(Boolean)
        .sort((a, b) => a.id.localeCompare(b.id));

      let filtered = all;
      if (category) {
        const needle = category.toLowerCase();
        filtered = filtered.filter((item) => item.category.toLowerCase() === needle);
      }
      if (search) {
        const needle = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.description.toLowerCase().includes(needle) ||
            item.category.toLowerCase().includes(needle)
        );
      }

      const offset = cursor ? Number(decodeCursor(cursor).offset) : 0;
      if (!Number.isInteger(offset) || offset < 0) {
        throw Errors.invalidCursor();
      }

      const slice = filtered.slice(offset, offset + limit);
      const nextOffset = offset + slice.length;
      const nextCursor = nextOffset < filtered.length ? encodeCursor({ offset: nextOffset }) : null;

      return {
        products: slice,
        nextCursor,
        count: slice.length,
      };
    },

    async listAll() {
      return (await store.listAllProducts(config.maxCatalogueItems))
        .map(publicProduct)
        .filter(Boolean)
        .sort((a, b) => a.id.localeCompare(b.id));
    },

    async getById(id) {
      const item = publicProduct(await store.getProduct(id));
      if (!item) throw Errors.productNotFound();
      return item;
    },
  };
}
