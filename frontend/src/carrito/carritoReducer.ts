import type { Producto } from '../api/schemas';

export type ProductoCarrito = Pick<Producto, 'id' | 'nombre' | 'precio'>;

export interface ItemCarrito {
  producto: ProductoCarrito;
  cantidad: number;
}

export type EstadoCarrito = ItemCarrito[];

export type AccionCarrito =
  | { tipo: 'agregar'; producto: ProductoCarrito }
  | { tipo: 'sumar'; id: number }
  | { tipo: 'restar'; id: number }
  | { tipo: 'quitar'; id: number }
  | { tipo: 'vaciar' };

export function carritoReducer(estado: EstadoCarrito, _accion: AccionCarrito): EstadoCarrito {
  return estado;
}