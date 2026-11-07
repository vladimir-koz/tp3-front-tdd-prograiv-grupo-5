import { createContext, useContext, type ReactNode } from 'react';
import type { Producto } from '../api/schemas';

interface CarritoContextValue {
  items: Producto[];
  agregar: (producto: Producto) => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  return (
    <CarritoContext.Provider value={{ items: [], agregar: () => {} }}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito(): CarritoContextValue {
  return useContext(CarritoContext) ?? { items: [], agregar: () => {} };
}
