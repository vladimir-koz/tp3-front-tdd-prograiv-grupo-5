import { describe, expect, it } from 'vitest';
import { carritoReducer, type EstadoCarrito } from './carritoReducer';

const expreso = { id: 5, nombre: 'Expreso Mediano Colombia', precio: 7360 };
const muffin = { id: 19, nombre: 'Muffin de chocolate', precio: 2500 };

// Estado congelado: si el reducer lo mutara, lanzaría un error.
const conExpresoYMuffin: EstadoCarrito = Object.freeze([
  Object.freeze({ producto: expreso, cantidad: 2 }),
  Object.freeze({ producto: muffin, cantidad: 1 })
]) as EstadoCarrito;

describe('carritoReducer', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    expect(carritoReducer([], { tipo: 'agregar', producto: expreso })).toEqual([
      { producto: expreso, cantidad: 1 }
    ]);
  });

  it('agregar un producto que ya está suma una unidad', () => {
    const estado = carritoReducer(conExpresoYMuffin, { tipo: 'agregar', producto: expreso });
    expect(estado).toHaveLength(2);
    expect(estado[0].cantidad).toBe(3);
  });

  it('guarda solo id, nombre y precio del producto', () => {
    const conExtras = { ...expreso, tipo: 'expreso', gramos: 27 };
    const [item] = carritoReducer([], { tipo: 'agregar', producto: conExtras });
    expect(item.producto).toEqual(expreso);
  });

  it('sumar aumenta la cantidad', () => {
    const estado = carritoReducer(conExpresoYMuffin, { tipo: 'sumar', id: 19 });
    expect(estado[1].cantidad).toBe(2);
  });

  it('restar disminuye la cantidad', () => {
    const estado = carritoReducer(conExpresoYMuffin, { tipo: 'restar', id: 5 });
    expect(estado[0].cantidad).toBe(1);
  });

  it('restar con cantidad 1 quita el producto', () => {
    const estado = carritoReducer(conExpresoYMuffin, { tipo: 'restar', id: 19 });
    expect(estado).toEqual([{ producto: expreso, cantidad: 2 }]);
  });

  it('quitar saca el producto y deja los demás', () => {
    const estado = carritoReducer(conExpresoYMuffin, { tipo: 'quitar', id: 5 });
    expect(estado).toEqual([{ producto: muffin, cantidad: 1 }]);
  });

  it('una acción sobre un producto que no está no cambia nada', () => {
    expect(carritoReducer(conExpresoYMuffin, { tipo: 'sumar', id: 99 })).toEqual(conExpresoYMuffin);
  });

  it('vaciar deja el carrito sin productos', () => {
    expect(carritoReducer(conExpresoYMuffin, { tipo: 'vaciar' })).toEqual([]);
  });
});