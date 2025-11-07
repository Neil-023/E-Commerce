import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mockData } from './mockData';

const CartContext = createContext();

const DEFAULT_CART_ID = mockData.cart_tbl[0]?.cart_id ?? 0;

const productMap = new Map(mockData.product_tbl.map((product) => [product.product_id, product]));
const sellerMap = new Map(
  mockData.users_tbl
    .filter((user) => user.role === 'seller')
    .map((seller) => [seller.user_id, seller])
);

const buildCartState = (items) => {
  const grouped = new Map();

  items.forEach((cartItem) => {
    const product = productMap.get(cartItem.product_id);
    if (!product) {
      return;
    }

    const sellerId = product.seller_id ?? 0;
    const seller = sellerMap.get(sellerId);

    if (!grouped.has(sellerId)) {
      grouped.set(sellerId, {
        seller_id: sellerId,
        seller_name: seller?.shop_name ?? 'Unknown Seller',
        items: [],
      });
    }

    grouped.get(sellerId).items.push({
      product_id: product.product_id,
      product_name: product.product_name,
      product_img: product.product_img,
      price: Number(product.price),
      quantity: cartItem.quantity,
      seller_id: sellerId,
      seller_name: seller?.shop_name ?? 'Unknown Seller',
      stock: product.avail_stocks,
    });
  });

  return Array.from(grouped.values());
};

export function CartProvider({ children }) {
  const initialItems = useMemo(
    () =>
      mockData.cart_items_tbl
        .filter((item) => item.cart_id === DEFAULT_CART_ID)
        .map((item) => ({ ...item })),
    []
  );

  const cartStoreRef = useRef(initialItems);
  const [cartBySeller, setCartBySeller] = useState(() => buildCartState(cartStoreRef.current));

  const syncCart = useCallback((nextItems) => {
    cartStoreRef.current = nextItems;
    setCartBySeller(buildCartState(nextItems));
  }, []);

  const loadCart = useCallback(() => {
    syncCart([...cartStoreRef.current]);
  }, [syncCart]);

  const addToCart = useCallback(
    (product, quantity) => {
      if (!product || quantity <= 0) {
        return;
      }

      const cap = product.stock ?? product.avail_stocks ?? quantity;
      const next = cartStoreRef.current.map((item) => ({ ...item }));
      const existing = next.find((item) => item.product_id === product.product_id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, cap);
      } else {
        next.push({
          cart_item_id: Date.now(),
          cart_id: DEFAULT_CART_ID,
          product_id: product.product_id,
          quantity: Math.min(quantity, cap),
        });
      }

      syncCart(next);
    },
    [syncCart]
  );

  const updateQuantity = useCallback(
    (productId, newQty) => {
      const next = cartStoreRef.current.map((item) => ({ ...item }));
      const entry = next.find((item) => item.product_id === productId);
      if (!entry) {
        return;
      }

      if (newQty <= 0) {
        syncCart(next.filter((item) => item.product_id !== productId));
        return;
      }

      const stock = productMap.get(productId)?.avail_stocks ?? newQty;
      entry.quantity = Math.min(newQty, stock);
      syncCart(next);
    },
    [syncCart]
  );

  const clearCart = useCallback(() => {
    syncCart([]);
  }, [syncCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider value={{ cartBySeller, addToCart, updateQuantity, loadCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
