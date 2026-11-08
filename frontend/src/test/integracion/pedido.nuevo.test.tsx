import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import type { Pedido } from '../../api/schemas';
import { catalogoApi, productos } from '../fixtures';
import { renderizarApp } from '../renderizarApp';
import { server } from '../server';

it('después de confirmar permite hacer otro pedido sin recargar, con el carrito vacío y la misma mesa', async () => {
  const urlOriginal = window.location.href;
  const muffin = productos[18];
  let consultasCatalogo = 0;
  let pedidosCreados = 0;

  server.use(
    http.get('*/productos', () => {
      consultasCatalogo++;
      return HttpResponse.json(catalogoApi);
    }),
    http.post('*/pedidos', async ({ request }) => {
      pedidosCreados++;
      const cuerpo = (await request.json()) as Pick<Pedido, 'mesa' | 'items'>;
      const pedido: Pedido = { id: 40 + pedidosCreados, ...cuerpo, estado: 'pendiente', total: muffin.precio };
      return HttpResponse.json(pedido, { status: 201 });
    })
  );

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    const user = userEvent.setup();
    renderizarApp();

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
    const confirmacion = await screen.findByRole('region', { name: 'Pedido #41' });

    await user.click(within(confirmacion).getByRole('button', { name: 'Hacer otro pedido' }));

    expect(screen.queryByRole('region', { name: 'Pedido #41' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Mesa 4');
    const carrito = screen.getByRole('region', { name: 'Tu pedido' });
    expect(within(carrito).getByText('Tu carrito está vacío')).toBeInTheDocument();
    expect(within(carrito).getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
    expect(consultasCatalogo).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Agregar Muffin de chocolate' }));
    await user.click(within(carrito).getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('region', { name: 'Pedido #42' })).toBeInTheDocument();
    expect(pedidosCreados).toBe(2);
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});
