import type { Producto } from '../api/schemas';

export type EstadoMenu =
  | { estado: 'cargando' }
  | { estado: 'listo'; productos: Producto[] };

export function useMenu(): { estado: EstadoMenu } {
  return { estado: { estado: 'cargando' } };
}
