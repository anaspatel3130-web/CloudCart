import { Errors } from "../lib/errors.js";
import { publicProduct } from "./product-service.js";

function emptyCart(userId) {
  return {
    userId,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createCartService(store, config) {
  async function hydrate(cart) {
    const items = [];
    for (const line of cart.items || []) {
      const product = publicProduct(await store.getProduct(line.productId));
      if (!product) continue;
      items.push({
        productId: product.id,
        quantity: line.quantity,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        lineTotal: product.price * line.quantity,
      });
    }
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      userId: cart.userId,
      items,
      total,
      itemCount,
      updatedAt: cart.updatedAt || null,
    };
  }

  async function readRaw(userId) {
    return (await store.getCart(userId)) || emptyCart(userId);
  }

  return {
    async get(userId) {
      return hydrate(await readRaw(userId));
    },

    async addOrUpdate(userId, productId, quantity, mode = "add") {
      const product = publicProduct(await store.getProduct(productId));
      if (!product) throw Errors.productNotFound();
      if (product.stock <= 0) {
        throw Errors.insufficientStock(productId);
      }

      const cart = await readRaw(userId);
      const items = Array.isArray(cart.items) ? [...cart.items] : [];
      const index = items.findIndex((item) => item.productId === productId);
      const currentQty = index >= 0 ? items[index].quantity : 0;
      const nextQty = mode === "set" ? quantity : currentQty + quantity;

      if (nextQty < 0) {
        throw Errors.invalidInput("quantity cannot be negative.");
      }
      if (nextQty > config.maxQuantity) {
        throw Errors.invalidInput(`quantity must be ${config.maxQuantity} or fewer.`);
      }
      if (nextQty > product.stock) {
        throw Errors.insufficientStock(productId);
      }

      if (nextQty === 0) {
        if (index >= 0) items.splice(index, 1);
      } else if (index >= 0) {
        items[index] = { productId, quantity: nextQty };
      } else {
        if (items.length >= config.maxCartItems) {
          throw Errors.invalidInput(`A cart can contain at most ${config.maxCartItems} distinct products.`);
        }
        items.push({ productId, quantity: nextQty });
      }

      const saved = await store.putCart({
        userId,
        items,
        updatedAt: new Date().toISOString(),
      });
      return hydrate(saved);
    },
  };
}
