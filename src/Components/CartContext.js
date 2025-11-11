// src/Components/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Helper: Get normalized email
const getCurrentEmail = () => {
  const email = localStorage.getItem('email');
  return email ? email.toLowerCase() : 'guest';
};

// Helper: Save cart immediately
const saveCartToStorage = (items, selected) => {
  try {
    const email = getCurrentEmail();
    const allCarts = JSON.parse(localStorage.getItem('allCarts')) || {};
    allCarts[email] = { items, selected };
    localStorage.setItem('allCarts', JSON.stringify(allCarts));
    console.log('✅ Cart saved for:', email);
  } catch (error) {
    console.error('❌ Failed to save cart:', error);
  }
};

// Helper: Load cart
const loadCartFromStorage = () => {
  try {
    const email = getCurrentEmail();
    const allCarts = JSON.parse(localStorage.getItem('allCarts')) || {};
    return allCarts[email] || { items: [], selected: [] };
  } catch (error) {
    console.error('❌ Failed to load cart:', error);
    return { items: [], selected: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Load cart on mount
  useEffect(() => {
    const { items, selected } = loadCartFromStorage();
    setCartItems(items);
    setSelectedItems(selected);
  }, []);

  // Cart actions that SAVE IMMEDIATELY
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.name === item.name && i.selectedSize === item.selectedSize
      );
      let newItems;
      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += item.quantity;
        newItems = updated;
      } else {
        newItems = [...prevItems, item];
      }
      // ✅ SAVE NOW
      saveCartToStorage(newItems, selectedItems);
      return newItems;
    });
  };

  const removeFromCart = (name, selectedSize) => {
    setCartItems((prev) => {
      const newItems = prev.filter(
        (item) => !(item.name === name && item.selectedSize === selectedSize)
      );
      // ✅ SAVE NOW
      saveCartToStorage(newItems, selectedItems);
      return newItems;
    });
    setSelectedItems((prev) =>
      prev.filter((key) => key !== `${name}-${selectedSize}`)
    );
  };

  const updateQuantity = (name, selectedSize, amount) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.name === name && item.selectedSize === selectedSize
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      );
      // ✅ SAVE NOW
      saveCartToStorage(newItems, selectedItems);
      return newItems;
    });
  };

  const toggleSelectItem = (name, selectedSize) => {
    const key = `${name}-${selectedSize}`;
    setSelectedItems((prev) => {
      const newSelected = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      // ✅ SAVE SELECTION TOO
      saveCartToStorage(cartItems, newSelected);
      return newSelected;
    });
  };

  const selectAllItems = (keys) => {
    setSelectedItems(keys);
    saveCartToStorage(cartItems, keys);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
    saveCartToStorage(cartItems, []);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems([]);
    saveCartToStorage([], []);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};