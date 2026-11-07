import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCarrito } from './CarritoContext';

describe('useCarrito', () => {
  it('falla si se usa fuera del CarritoProvider', () => {
    // React registra el error del render en consola; lo silenciamos para no ensuciar la salida.
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCarrito())).toThrow(
      'useCarrito debe usarse dentro de un CarritoProvider'
    );

    consola.mockRestore();
  });
});
