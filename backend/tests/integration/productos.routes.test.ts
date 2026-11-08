import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('GET /productos', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp( createDb(':memory:') );
  });

  it('responde 200 con los 20 productos del catálogo', async () => {
    const res = await request(app).get('/productos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(20);
  });

  it('cada producto incluye id, nombre, precioBase y su precio calculado', async () => {
    const res = await request(app).get('/productos');

    for (const producto of res.body) {
      expect(producto).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          nombre: expect.any(String),
          precioBase: expect.any(Number),
          precio: expect.any(Number)
        })
      );
    }
  });
});

describe('GET /productos/:id', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp( createDb(':memory:') );
  });

  it('responde 200 con un café, su variedad y su precio final', async () => {
    const res = await request(app).get('/productos/9');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 9,
      tipo: 'expreso',
      nombre: 'Expreso Taza grande Etiopía',
      precioBase: 2500,
      tamano: 'Taza grande',
      gramos: 36,
      variedad: {
        id: 3,
        nombre: 'Etiopía',
        precioPorGramo: 240,
        acidez: 'muy viva',
        cuerpo: 'ligero',
        notas: 'frutales'
      },
      precio: 11140
    });
  });

  it('responde 200 con un producto de pastelería', async () => {
    const res = await request(app).get('/productos/20');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 20,
      tipo: 'pasteleria',
      nombre: 'Porción de torta selva negra',
      precioBase: 4200,
      precio: 4200
    });
  });

  it('responde 404 cuando el producto no existe', async () => {
    const res = await request(app).get('/productos/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'NoEncontrado' });
  });

  it('responde 404 cuando el id no es numérico', async () => {
    const res = await request(app).get('/productos/abc');
    expect(res.status).toBe(404);
  });
});
