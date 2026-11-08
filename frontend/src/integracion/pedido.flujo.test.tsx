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

it('muestra el error del servidor, conserva el carrito y permite confirmar al reintentar', async () => {
  const urlOriginal = window.location.href;
  const muffin = productos[18];
  const pedidoCreado: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [{ productoId: muffin.id, cantidad: 1 }],
    total: muffin.precio
  };

  server.use(
    http.get('*/productos', () => HttpResponse.json(catalogoApi)),
    http.post('*/pedidos', () =>
      HttpResponse.json({ error: 'ErrorInterno' }, { status: 500 })
    )
  );

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    const user = userEvent.setup();
    renderizarApp(<ObservarCarrito />);

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ErrorInterno');
    const carrito = screen.getByRole('region', { name: 'Tu pedido' });
    const item = within(carrito).getByRole('listitem', { name: 'Muffin de chocolate' });
    expect(within(item).getByText('1')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Pedido #/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Entradas del carrito' })).toHaveTextContent(/^1$/);

    server.use(
      http.post('*/pedidos', () => HttpResponse.json(pedidoCreado, { status: 201 }))
    );
    await user.click(within(carrito).getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Entradas del carrito' })).toHaveTextContent(/^0$/);
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});

it('impide confirmar nuevamente mientras el pedido está pendiente de respuesta', async () => {
  const urlOriginal = window.location.href;
  const muffin = productos[18];
  const pedidoCreado: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [{ productoId: muffin.id, cantidad: 1 }],
    total: muffin.precio
  };
  let solicitudes = 0;
  let responder = () => {};
  const respuestaPendiente = new Promise<void>(resolve => {
    responder = resolve;
  });

  server.use(
    http.get('*/productos', () => HttpResponse.json(catalogoApi)),
    http.post('*/pedidos', async () => {
      solicitudes++;
      await respuestaPendiente;
      return HttpResponse.json(pedidoCreado, { status: 201 });
    })
  );

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    const user = userEvent.setup();
    renderizarApp();

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));
    const confirmar = screen.getByRole('button', { name: 'Confirmar pedido' });
    await user.click(confirmar);

    await waitFor(() => expect(solicitudes).toBe(1));
    expect(confirmar).toBeDisabled();

    await user.click(confirmar);
    expect(solicitudes).toBe(1);

    responder();

    expect(await screen.findByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
    expect(solicitudes).toBe(1);
  } finally {
    responder();
    window.history.replaceState(null, '', urlOriginal);
  }
});

it('envía mesa null para retiro en barra y muestra la confirmación del pedido', async () => {
  const urlOriginal = window.location.href;
  const muffin = productos[18];
  const nuevoPedido: Pick<Pedido, 'mesa' | 'items'> = {
    mesa: null,
    items: [{ productoId: muffin.id, cantidad: 1 }]
  };
  const pedidoCreado: Pedido = {
    id: 42,
    ...nuevoPedido,
    estado: 'pendiente',
    total: muffin.precio
  };
  let cuerpoRecibido: unknown;

  server.use(
    http.get('*/productos', () => HttpResponse.json(catalogoApi)),
    http.post('*/pedidos', async ({ request }) => {
      cuerpoRecibido = await request.json();
      return HttpResponse.json(pedidoCreado, { status: 201 });
    })
  );

  try {
    window.history.replaceState(null, '', '/');
    const user = userEvent.setup();
    renderizarApp();

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
    expect(cuerpoRecibido).toEqual(nuevoPedido);
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});
