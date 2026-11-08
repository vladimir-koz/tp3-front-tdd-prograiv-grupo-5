import { expect, test } from '@playwright/test';
import { resetAndSeed } from './helpers';

// Estado inicial (ver /__test__/seed en src/app.ts):
//  - Pedido 1: 2 × Expreso Pocillo Colombia ($5.740) + 1 × Muffin ($2.500) = $13.980
//  - Pedido 2: 1 × Expreso Pocillo Colombia ($5.740)                       = $5.740
const FACTURACION_INICIAL = 13980 + 5740;
const FILTRADO_TAZA_GRANDE_ETIOPIA = 18; // $9.200

test.beforeEach(async ({ baseURL }) => {
  if (!baseURL) throw new Error('Playwright requiere una baseURL');
  await resetAndSeed(baseURL);
});

test('flujo completo: consultar catálogo, crear un pedido y ver los reportes', async ({ request }) => {
  const productoRes = await request.get(`/productos/${FILTRADO_TAZA_GRANDE_ETIOPIA}`);
  expect(productoRes.status()).toBe(200);
  const producto = await productoRes.json();
  expect(producto).toMatchObject({ nombre: 'Filtrado Taza grande Etiopía', precio: 9200 });

  const inicialRes = await request.get('/pedidos');
  expect(await inicialRes.json()).toHaveLength(2);

  const facturacionInicial = await request.get('/reportes/facturacion');
  expect(await facturacionInicial.json()).toEqual({ total: FACTURACION_INICIAL });

  const createRes = await request.post('/pedidos', {
    data: { mesa: 4, items: [{ productoId: FILTRADO_TAZA_GRANDE_ETIOPIA, cantidad: 4 }] }
  });
  expect(createRes.status()).toBe(201);
  const pedido = await createRes.json();
  expect(pedido).toMatchObject({ mesa: 4, estado: 'pendiente', total: 9200 * 4 });

  const getRes = await request.get(`/pedidos/${pedido.id}`);
  expect(getRes.status()).toBe(200);
  expect(await getRes.json()).toEqual(pedido);

  const listaRes = await request.get('/pedidos');
  expect(await listaRes.json()).toHaveLength(3);

  const facturacionRes = await request.get('/reportes/facturacion');
  expect(await facturacionRes.json()).toEqual({ total: FACTURACION_INICIAL + 9200 * 4 });

  const masVendidoRes = await request.get('/reportes/mas-vendido');
  expect(masVendidoRes.status()).toBe(200);
  expect(await masVendidoRes.json()).toEqual({
    tipo: 'filtrado',
    cantidad: 4
  });
});

test('un pedido con un producto inexistente se rechaza y no afecta la facturación', async ({ request }) => {
  const createRes = await request.post('/pedidos', {
    data: { items: [{ productoId: 999, cantidad: 1 }] }
  });

  expect(createRes.status()).toBe(400);
  expect(await createRes.json()).toEqual({ error: 'ProductoInexistente', productoId: 999 });

  const listaRes = await request.get('/pedidos');
  expect(await listaRes.json()).toHaveLength(2);

  const facturacionRes = await request.get('/reportes/facturacion');
  expect(await facturacionRes.json()).toEqual({ total: FACTURACION_INICIAL });
});
