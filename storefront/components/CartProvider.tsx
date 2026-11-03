"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "pulsecart.cart.v1";

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is CartItem => {
      if (!entry || typeof entry !== "object") return false;
      const item = entry as Partial<CartItem>;
      return (
        typeof item.slug === "string" &&
        typeof item.title === "string" &&
        typeof item.priceZar === "number" &&
        typeof item.image === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
      );
    })
    .map((item) => ({ ...item, quantity: Math.min(20, Math.round(item.quantity)) }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(sanitize(JSON.parse(raw)));
    } catch {
      // Corrupt storage should never block the store.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private mode or quota exceeded: keep the in-memory cart working.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.slug === item.slug);
      if (existing) {
        return current.map((entry) =>
          entry.slug === item.slug
            ? { ...entry, quantity: Math.min(20, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, { ...item, quantity: Math.min(20, Math.max(1, quantity)) }];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.slug === slug
            ? { ...entry, quantity: Math.max(0, Math.min(20, Math.round(quantity))) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.priceZar * item.quantity, 0);
    return { items, hydrated, count, subtotal, addItem, removeItem, setQuantity, clear };
  }, [items, hydrated, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
