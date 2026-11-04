import { useEffect, useState } from 'react';
import { obtenerProductos } from '../api/cliente';
import type { Producto } from '../api/schemas';

export type EstadoMenu =
  | { estado: 'cargando' }
  | { estado: 'listo'; productos: Producto[] };

export function useMenu(): { estado: EstadoMenu } {
  const [estado, setEstado] = useState<EstadoMenu>({ estado: 'cargando' });

  useEffect(() => {
    obtenerProductos().then(productos => {
      setEstado({ estado: 'listo', productos });
    });
  }, []);

  return { estado };
}
