import { expect, it } from 'vitest';
import { leerMesa } from './mesa';

it('interpreta ?mesa=4 y devuelve el número de mesa', () => {
  expect(leerMesa('?mesa=4')).toBe(4);
});
