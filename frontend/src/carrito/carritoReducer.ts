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

function cambiarCantidad(estado: EstadoCarrito, id: number, delta: number): EstadoCarrito {
  return estado
    .map(item => (item.producto.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
    .filter(item => item.cantidad > 0);
}

export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.tipo) {
    case 'agregar': {
      const { id, nombre, precio } = accion.producto;
      const yaEsta = estado.some(item => item.producto.id === id);
      return yaEsta
        ? cambiarCantidad(estado, id, 1)
        : [...estado, { producto: { id, nombre, precio }, cantidad: 1 }];
    }
    case 'sumar':
      return cambiarCantidad(estado, accion.id, 1);
    case 'restar':
      // Con cantidad 1, restar quita el producto del carrito.
      return cambiarCantidad(estado, accion.id, -1);
    case 'quitar':
      return estado.filter(item => item.producto.id !== accion.id);
    case 'vaciar':
      return [];
  }
}

export function subtotalItem(_item: ItemCarrito): number {
  return 0;
}

export function subtotalCarrito(_estado: EstadoCarrito): number {
  return 0;
}