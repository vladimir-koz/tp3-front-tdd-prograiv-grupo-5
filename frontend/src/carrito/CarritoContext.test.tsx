import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { productos } from '../test/fixtures';
import { CarritoProvider, useCarrito } from './CarritoContext';

describe('useCarrito', () => {
  it('falla si se usa fuera del CarritoProvider', () => {
    // React registra el error del render en consola; lo silenciamos para no ensuciar la salida.
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCarrito())).toThrow(
      'useCarrito debe usarse dentro de un CarritoProvider'
    );

    consola.mockRestore();
  });

  it('agrupa un producto agregado dos veces en una entrada con cantidad 2', () => {
    const muffin = productos[18];
    const { result } = renderHook(() => useCarrito(), { wrapper: CarritoProvider });

    act(() => {
      result.current.agregar(muffin);
      result.current.agregar(muffin);
    });

    expect(result.current.items).toEqual([
      {
        producto: { id: muffin.id, nombre: muffin.nombre, precio: muffin.precio },
        cantidad: 2
      }
    ]);
  });

  it('expone sumar, restar, quitar y vaciar conectados al estado del carrito', () => {
    const muffin = productos[18];
    const { result } = renderHook(() => useCarrito(), { wrapper: CarritoProvider });

    act(() => {
      result.current.agregar(muffin);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cantidad).toBe(1);

    act(() => {
      result.current.sumar(muffin.id);
    });
    expect(result.current.items[0].cantidad).toBe(2);

    act(() => {
      result.current.restar(muffin.id);
    });
    expect(result.current.items[0].cantidad).toBe(1);

    act(() => {
      result.current.quitar(muffin.id);
    });
    expect(result.current.items).toEqual([]);

    act(() => {
      result.current.agregar(muffin);
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.vaciar();
    });
    expect(result.current.items).toEqual([]);
  });
});
