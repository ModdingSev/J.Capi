'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ReservationCartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const ReservationCartContext = createContext<ReservationCartContextType | undefined>(undefined);

export function ReservationCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar de localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('jcapi_reservation_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing cart from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando cambie (solo si ya se ha cargado)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jcapi_reservation_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === newItem.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === newItem.productId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <ReservationCartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </ReservationCartContext.Provider>
  );
}

export function useReservationCart() {
  const context = useContext(ReservationCartContext);
  if (!context) {
    throw new Error('useReservationCart debe usarse dentro de ReservationCartProvider');
  }
  return context;
}
