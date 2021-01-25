import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@goMarketPlace:products',
      );
      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProduct = { ...product, quantity: 1 };
      const Selectedproduct = products.find(el => el.id === product.id);

      if (!Selectedproduct) {
        setProducts([...products, newProduct]);
      } else {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      }

      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const Selectedproduct = products.find(el => el.id === id);
      if (Selectedproduct) {
        setProducts(
          products.map(p =>
            p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
          ),
        );
      }
      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const Selectedproduct = products.find(el => el.id === id);
      if (Selectedproduct) {
        setProducts(
          products.map(p =>
            p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
          ),
        );
      }
      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
