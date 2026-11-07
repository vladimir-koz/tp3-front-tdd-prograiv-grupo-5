import { describe, expect, it } from 'vitest';
import { formatearPrecio } from './precio';

describe('formatearPrecio', () => {
  it('usa punto como separador de miles', () => {
    expect(formatearPrecio(7360)).toBe('$7.360');
  });

  it('formatea montos de cinco cifras', () => {
    expect(formatearPrecio(11140)).toBe('$11.140');
  });

  it('no agrega separador a montos menores a mil', () => {
    expect(formatearPrecio(500)).toBe('$500');
  });

  it('formatea el cero', () => {
    expect(formatearPrecio(0)).toBe('$0');
  });
});
