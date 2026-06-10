import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface CartItem {
  product: any;
  quantity: number;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  wishlist: any[];
  toggleWishlist: (product: any) => void;
  coupon: { code: string; discount: number } | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('fb_token');
    const storedUser = localStorage.getItem('fb_user');
    const storedCart = localStorage.getItem('fb_cart');
    const storedWishlist = localStorage.getItem('fb_wishlist');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('fb_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('fb_cart');
    }
  }, [cart]);

  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem('fb_wishlist', JSON.stringify(wishlist));
    } else {
      localStorage.removeItem('fb_wishlist');
    }
  }, [wishlist]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fb_token', newToken);
    localStorage.setItem('fb_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    setCoupon(null);
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    localStorage.removeItem('fb_cart');
    localStorage.removeItem('fb_wishlist');
  };

  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        // Enforce maximum stock bounds
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    localStorage.removeItem('fb_cart');
  };

  const toggleWishlist = (product: any) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const applyCoupon = (code: string): boolean => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === 'FRESH20') {
      setCoupon({ code: 'FRESH20', discount: 20 }); // 20% Off
      return true;
    }
    if (uppercaseCode === 'HEALTHY10') {
      setCoupon({ code: 'HEALTHY10', discount: 10 }); // 10% Off
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        coupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
