
import React, { createContext, useContext, useState } from 'react';
import { Book } from '../lib/api';
import { CartItem } from '../types';
import { toast } from '../components/ui/sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, days: number) => void;
  removeFromCart: (bookId: string) => void;
  updateRentalDays: (bookId: string, days: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateRentalDays: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalAmount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (book: Book, rentalDays: number) => {
    // Check if book is already in cart
    const existingItem = items.find(item => item.book.id === book.id);
    
    if (existingItem) {
      toast.info("This book is already in your cart");
      return;
    }

    setItems(prevItems => [...prevItems, { book, rentalDays }]);
    toast.success(`${book.title} added to cart`);
  };

  const removeFromCart = (bookId: string) => {
    setItems(prevItems => prevItems.filter(item => item.book.id !== bookId));
    toast.info("Item removed from cart");
  };

  const updateRentalDays = (bookId: string, days: number) => {
    setItems(prevItems => prevItems.map(item => 
      item.book.id === bookId ? { ...item, rentalDays: days } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.length;
  
  const totalAmount = items.reduce((total, item) => {
    return total + (item.book.price * item.rentalDays);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateRentalDays,
      clearCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
