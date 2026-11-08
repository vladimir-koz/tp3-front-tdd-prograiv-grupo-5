import { expect, test } from '@playwright/test';
import { PedidoSchema, ProductoSchema } from '../src/api/schemas';

test('permite comprar desde la mesa 4 y consultar el estado actualizado del pedido', async ({ page, request }) => {
  const reset = await request.post('/__test__/reset');
  expect(reset.status()).toBe(204);
  const seed = await request.post('/__test__/seed');
  expect(seed.status()).toBe(201);

  const respuestaCafe = await request.get('/productos/5');
  expect(respuestaCafe.status()).toBe(200);
  const cafe = ProductoSchema.parse(await respuestaCafe.json());
  expect(cafe).toMatchObject({
    id: 5,
    tipo: 'expreso',
    tamano: 'Mediano',
    variedad: { nombre: 'Colombia' }
  });
  const respuestaMuffin = await request.get('/productos/19');
  expect(respuestaMuffin.status()).toBe(200);
  const muffin = ProductoSchema.parse(await respuestaMuffin.json());
  expect(muffin).toMatchObject({ id: 19, nombre: 'Muffin de chocolate', tipo: 'pasteleria' });

  await page.goto('/?mesa=4');
  await expect(page.getByRole('banner').getByText('Mesa 4', { exact: true })).toBeVisible();

  const selectorCafe = page.getByRole('region', { name: 'Café', exact: true });
  await selectorCafe.getByText('Expreso', { exact: true }).click();
  await selectorCafe.getByText('Mediano', { exact: true }).click();
  await selectorCafe.getByText('Colombia', { exact: true }).click();
  await selectorCafe.getByRole('button', { name: 'Agregar café' }).click();

  const carrito = page.getByRole('region', { name: 'Tu pedido' });
  await carrito.getByRole('button', { name: `Sumar ${cafe.nombre}`, exact: true }).click();
  await expect(carrito.getByRole('listitem', { name: cafe.nombre, exact: true })
    .getByText('2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Agregar ${muffin.nombre}`, exact: true }).click();
  await expect(carrito.getByRole('listitem', { name: muffin.nombre, exact: true })
    .getByText('1', { exact: true })).toBeVisible();

  const creacionPendiente = page.waitForResponse(response =>
    response.request().method() === 'POST' && new URL(response.url()).pathname === '/pedidos'
  );
  await carrito.getByRole('button', { name: 'Confirmar pedido' }).click();
  const creacion = await creacionPendiente;
  expect(creacion.request().postDataJSON()).toEqual({
    mesa: 4,
    items: [
      { productoId: cafe.id, cantidad: 2 },
      { productoId: muffin.id, cantidad: 1 }
    ]
  });
  expect(creacion.status()).toBe(201);
  const pedido = PedidoSchema.parse(await creacion.json());
  expect(pedido.estado).toBe('pendiente');
  expect(pedido.total).toBe(cafe.precio * 2 + muffin.precio);

  const confirmacion = page.getByRole('region', { name: `Pedido #${pedido.id}`, exact: true });
  await expect(confirmacion.getByRole('heading', { name: `Pedido #${pedido.id}`, exact: true })).toBeVisible();
  await expect(confirmacion.getByText('Pendiente', { exact: true })).toBeVisible();
  await expect(confirmacion.getByText(`$${pedido.total.toLocaleString('es-AR')}`, { exact: true })).toBeVisible();

  const cambioEstado = await request.patch(`/pedidos/${pedido.id}/estado`, {
    data: { estado: 'en_preparacion' }
  });
  expect(cambioEstado.status()).toBe(200);
  expect(PedidoSchema.parse(await cambioEstado.json())).toMatchObject({
    id: pedido.id,
    estado: 'en_preparacion'
  });

  const consultaPendiente = page.waitForResponse(response =>
    response.request().method() === 'GET' && new URL(response.url()).pathname === `/pedidos/${pedido.id}`
  );
  await confirmacion.getByRole('button', { name: 'Actualizar estado' }).click();
  const consulta = await consultaPendiente;
  expect(consulta.status()).toBe(200);
  expect(PedidoSchema.parse(await consulta.json())).toMatchObject({ id: pedido.id, estado: 'en_preparacion' });
  await expect(confirmacion.getByText('En preparación', { exact: true })).toBeVisible();
});
