import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { catalogoApi } from '../test/fixtures';
import { renderizarApp } from '../test/renderizarApp';
import { server } from '../test/server';

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
