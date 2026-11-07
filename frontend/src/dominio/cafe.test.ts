import { describe, expect, it } from 'vitest';
import { productos } from '../test/fixtures';
import { buscarCafe, describirOrigen, esCafe, esPasteleria, origenes } from './cafe';

describe('esCafe y esPasteleria', () => {
  it('separan los 18 cafés de los 2 productos de pastelería', () => {
    expect(productos.filter(esCafe)).toHaveLength(18);
    expect(productos.filter(esPasteleria).map(p => p.nombre)).toEqual([
      'Muffin de chocolate',
      'Porción de torta selva negra'
    ]);
  });
});

describe('buscarCafe', () => {
  it('encuentra el expreso mediano de Colombia', () => {
    const cafe = buscarCafe(productos, { bebida: 'expreso', tamano: 'Mediano', origen: 'Colombia' });
    expect(cafe?.id).toBe(5);
    expect(cafe?.precio).toBe(7360);
  });

  it('encuentra el filtrado taza grande de Etiopía', () => {
    const cafe = buscarCafe(productos, { bebida: 'filtrado', tamano: 'Taza grande', origen: 'Etiopía' });
    expect(cafe?.id).toBe(18);
  });

  it.each([
    { tamano: 'Mediano' as const, origen: 'Colombia' },
    { bebida: 'expreso' as const, origen: 'Colombia' },
    { bebida: 'expreso' as const, tamano: 'Mediano' as const }
  ])('devuelve undefined si la elección está incompleta (%o)', eleccion => {
    expect(buscarCafe(productos, eleccion)).toBeUndefined();
  });

  it('devuelve undefined si el origen no existe', () => {
    expect(buscarCafe(productos, { bebida: 'expreso', tamano: 'Mediano', origen: 'Kenia' })).toBeUndefined();
  });
});

describe('origenes', () => {
  it('devuelve cada variedad una sola vez en el orden de la carta', () => {
    expect(origenes(productos).map(v => v.nombre)).toEqual(['Colombia', 'Etiopía', 'Brasil']);
  });

  it('sin cafés no hay orígenes', () => {
    expect(origenes(productos.filter(p => p.tipo === 'pasteleria'))).toEqual([]);
  });
});

describe('describirOrigen', () => {
  it('arma la descripción con acidez, cuerpo y notas', () => {
    const colombia = origenes(productos)[0];
    expect(describirOrigen(colombia)).toBe('Acidez media, cuerpo equilibrado, notas cítricas y florales');
  });
});
