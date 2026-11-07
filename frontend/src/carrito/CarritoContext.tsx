import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Producto } from '../api/schemas';

interface CarritoContextValue {
  items: Producto[];
  agregar: (producto: Producto) => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

// Versión mínima: guarda los productos agregados en memoria.
// Cuando llegue el minicart se reemplaza por un reducer con cantidades.
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Producto[]>([]);

  const agregar = useCallback((producto: Producto) => {
    // Temporal, para ver lo agregado en el navegador hasta tener el minicart.
    console.log('Agregado al carrito:', producto);
    setItems(anteriores => [...anteriores, producto]);
  }, []);

  const value = useMemo(() => ({ items, agregar }), [items, agregar]);

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const contexto = useContext(CarritoContext);

  if (contexto === null) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }

  return contexto;
}
