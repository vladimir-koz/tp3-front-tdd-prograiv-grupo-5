import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { crearPedido, obtenerPedido } from '../../api/cliente';
import type { Pedido } from '../../api/schemas';
import { server } from '../server';

it('envía POST /pedidos con mesa e ítems y devuelve el pedido de la respuesta 201', async () => {
  const nuevoPedido: Pick<Pedido, 'mesa' | 'items'> = {
    mesa: 4,
    items: [
      { productoId: 5, cantidad: 2 },
      { productoId: 19, cantidad: 1 }
    ]
  };
  const respuestaApi: Pedido = {
    id: 42,
    ...nuevoPedido,
    estado: 'pendiente',
    total: 17220
  };
  let solicitudRecibida: unknown;

  server.use(
    http.post('*/pedidos', async ({ request }) => {
      solicitudRecibida = {
        metodo: request.method,
        ruta: new URL(request.url).pathname,
        tipoContenido: request.headers.get('Content-Type'),
        cuerpo: await request.json()
      };
      return HttpResponse.json(respuestaApi, { status: 201 });
    })
  );

  const pedido = await crearPedido(nuevoPedido);

  expect(solicitudRecibida).toEqual({
    metodo: 'POST',
    ruta: '/pedidos',
    tipoContenido: 'application/json',
    cuerpo: nuevoPedido
  });
  expect(pedido).toEqual(respuestaApi);
});

it('rechaza con MesaInexistente cuando la API responde HTTP 400', async () => {
  server.use(
    http.post('*/pedidos', () =>
      HttpResponse.json({ error: 'MesaInexistente' }, { status: 400 })
    )
  );

  await expect(crearPedido({
    mesa: 26,
    items: [{ productoId: 19, cantidad: 1 }]
  })).rejects.toThrow(new Error('MesaInexistente'));
});

it('consulta GET /pedidos/42 y devuelve el pedido de la respuesta 200', async () => {
  const respuestaApi: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'en_preparacion',
    items: [{ productoId: 19, cantidad: 1 }],
    total: 2500
  };
  let rutaConsultada = '';

  server.use(
    http.get('*/pedidos/:id', ({ request }) => {
      rutaConsultada = new URL(request.url).pathname;
      return HttpResponse.json(respuestaApi, { status: 200 });
    })
  );

  const pedido = await obtenerPedido(42);

  expect(rutaConsultada).toBe('/pedidos/42');
  expect(pedido).toEqual(respuestaApi);
});

it('rechaza con NoEncontrado cuando GET /pedidos/42 responde HTTP 404', async () => {
  server.use(
    http.get('*/pedidos/42', () =>
      HttpResponse.json({ error: 'NoEncontrado' }, { status: 404 })
    )
  );

  await expect(obtenerPedido(42)).rejects.toThrow(new Error('NoEncontrado'));
});

it('informa un mensaje comprensible si falla la conexión durante POST /pedidos', async () => {
  server.use(http.post('*/pedidos', () => HttpResponse.error()));

  await expect(crearPedido({
    mesa: 4,
    items: [{ productoId: 19, cantidad: 1 }]
  })).rejects.toThrow(new Error('No se pudo conectar con el servidor'));
});

it('informa un mensaje comprensible si falla la conexión durante GET /pedidos/42', async () => {
  server.use(http.get('*/pedidos/42', () => HttpResponse.error()));

  await expect(obtenerPedido(42)).rejects.toThrow(new Error('No se pudo conectar con el servidor'));
});

it('informa que no se pudo conectar si POST /pedidos responde 502 con HTML', async () => {
  server.use(
    http.post('*/pedidos', () => HttpResponse.html('<h1>502 Bad Gateway</h1>', { status: 502 }))
  );

  await expect(crearPedido({
    mesa: 4,
    items: [{ productoId: 19, cantidad: 1 }]
  })).rejects.toThrow(new Error('No se pudo conectar con el servidor'));
});

it('rechaza con un mensaje claro un pedido creado que no cumple el contrato', async () => {
  server.use(
    http.post('*/pedidos', () =>
      HttpResponse.json({ id: 42, mesa: 4, estado: 'desconocido', items: [], total: -1 }, { status: 201 })
    )
  );

  await expect(crearPedido({
    mesa: 4,
    items: [{ productoId: 19, cantidad: 1 }]
  })).rejects.toThrow(new Error('La respuesta del servidor no tiene el formato esperado'));
});

it('informa que no se pudo conectar si GET /pedidos/42 responde 500 sin cuerpo JSON', async () => {
  server.use(http.get('*/pedidos/42', () => new HttpResponse(null, { status: 500 })));

  await expect(obtenerPedido(42)).rejects.toThrow(new Error('No se pudo conectar con el servidor'));
});

it('rechaza con un mensaje claro un pedido consultado que no cumple el contrato', async () => {
  server.use(http.get('*/pedidos/42', () => HttpResponse.json({ id: 42 }, { status: 200 })));

  await expect(obtenerPedido(42)).rejects.toThrow(
    new Error('La respuesta del servidor no tiene el formato esperado')
  );
});
