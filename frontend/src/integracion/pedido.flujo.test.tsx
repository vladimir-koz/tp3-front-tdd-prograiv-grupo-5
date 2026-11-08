import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import type { Pedido } from '../api/schemas';
import { useCarrito } from '../carrito/CarritoContext';
import { catalogoApi, productos } from '../test/fixtures';
import { renderizarApp } from '../test/renderizarApp';
import { server } from '../test/server';

function ObservarCarrito() {
  const { items } = useCarrito();
  return <output aria-label="Entradas del carrito">{items.length}</output>;
}

it('muestra en el minicart el producto agregado desde el catálogo', async () => {
  server.use(http.get('*/productos', () => HttpResponse.json(catalogoApi)));
  const user = userEvent.setup();
  renderizarApp();

  await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));

  const carrito = screen.getByRole('region', { name: 'Tu pedido' });
  const item = within(carrito).getByRole('listitem', { name: 'Muffin de chocolate' });
  expect(within(item).getByText('Muffin de chocolate')).toBeInTheDocument();
  expect(within(item).getByText('1')).toBeInTheDocument();
  expect(within(carrito).getByRole('button', { name: 'Confirmar pedido' })).toBeEnabled();
});

it('envía el pedido de la mesa 4, muestra la confirmación y vacía el carrito después del éxito', async () => {
  const urlOriginal = window.location.href;
  const muffin = productos[18];
  const nuevoPedido: Pick<Pedido, 'mesa' | 'items'> = {
    mesa: 4,
    items: [{ productoId: muffin.id, cantidad: 1 }]
  };
  const pedidoCreado: Pedido = {
    id: 42,
    ...nuevoPedido,
    estado: 'pendiente',
    total: muffin.precio
  };
  let solicitudRecibida: unknown;
  let responder = () => {};
  const respuestaPendiente = new Promise<void>(resolve => {
    responder = resolve;
  });

  server.use(
    http.get('*/productos', () => HttpResponse.json(catalogoApi)),
    http.post('*/pedidos', async ({ request }) => {
      solicitudRecibida = {
        metodo: request.method,
        ruta: new URL(request.url).pathname,
        cuerpo: await request.json()
      };
      await respuestaPendiente;
      return HttpResponse.json(pedidoCreado, { status: 201 });
    })
  );

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    const user = userEvent.setup();
    renderizarApp(<ObservarCarrito />);

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    await waitFor(() => expect(solicitudRecibida).toEqual({
      metodo: 'POST',
      ruta: '/pedidos',
      cuerpo: nuevoPedido
    }));
    expect(screen.getByRole('status', { name: 'Entradas del carrito' })).toHaveTextContent(/^1$/);

    responder();

    const confirmacion = await screen.findByRole('region', { name: 'Pedido #42' });
    expect(within(confirmacion).getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
    expect(within(confirmacion).getByText('Pendiente')).toBeInTheDocument();
    expect(within(confirmacion).getByText('$2.500')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Entradas del carrito' })).toHaveTextContent(/^0$/);
  } finally {
    responder();
    window.history.replaceState(null, '', urlOriginal);
  }
});
