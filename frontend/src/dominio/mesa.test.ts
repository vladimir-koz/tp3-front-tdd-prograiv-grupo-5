import { expect, it } from 'vitest';
import { leerMesa } from './mesa';

it('interpreta ?mesa=4 y devuelve el número de mesa', () => {
  expect(leerMesa('?mesa=4')).toBe(4);
});

it.each([
  { caso: 'no existe el parámetro mesa', search: '' },
  { caso: 'el parámetro está vacío', search: '?mesa=' },
  { caso: 'contiene texto no numérico', search: '?mesa=abc' },
  { caso: 'vale cero', search: '?mesa=0' },
  { caso: 'es negativo', search: '?mesa=-1' },
  { caso: 'es decimal', search: '?mesa=4.5' },
  { caso: 'supera el rango de enteros seguros', search: '?mesa=9007199254740992' }
])('devuelve null cuando $caso', ({ search }) => {
  expect(leerMesa(search)).toBeNull();
});
