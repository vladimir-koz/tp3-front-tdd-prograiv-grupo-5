import { useEffect, useState } from 'react';
import { obtenerProductos } from '../api/cliente';
import type { Producto } from '../api/schemas';

export type EstadoMenu =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'listo'; productos: Producto[] };

export function useMenu(): { estado: EstadoMenu; reintentar: () => void } {
  const [estado, setEstado] = useState<EstadoMenu>({ estado: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    obtenerProductos().then(
      productos => {
        setEstado({ estado: 'listo', productos });
      },
      (error: unknown) => {
        setEstado({
          estado: 'error',
          mensaje: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
        });
      }
    );
  }, [intento]);

  function reintentar() {
    setEstado({ estado: 'cargando' });
    setIntento(anterior => anterior + 1);
  }

  return { estado, reintentar };
}
