import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { crearPedido } from '../api/cliente';
import type { Pedido } from '../api/schemas';
import { server } from '../test/server';

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
