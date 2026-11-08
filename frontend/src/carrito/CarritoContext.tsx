import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Producto } from '../api/schemas';
import { carritoReducer, type EstadoCarrito } from './carritoReducer';

interface CarritoContextValue {
  items: EstadoCarrito;
  agregar: (producto: Producto) => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(carritoReducer, []);

  const agregar = useCallback((producto: Producto) => {
    dispatch({ tipo: 'agregar', producto });
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
