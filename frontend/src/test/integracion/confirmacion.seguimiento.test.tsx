import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import type { Pedido } from '../../api/schemas';
import { Confirmacion } from '../../componentes/Confirmacion';
import { server } from '../server';

it('consulta el pedido 42 y muestra su estado actualizado desde la confirmación', async () => {
  const pedido: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [{ productoId: 19, cantidad: 1 }],
    total: 2500
  };
  let consultas = 0;

  server.use(
    http.get('*/pedidos/42', () => {
      consultas++;
      return HttpResponse.json({ ...pedido, estado: 'en_preparacion' }, { status: 200 });
    })
  );
  const user = userEvent.setup();

  render(<Confirmacion pedido={pedido} />);

  expect(screen.getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
  expect(screen.getByText('Pendiente')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Actualizar estado' }));

  expect(await screen.findByText('En preparación')).toBeInTheDocument();
  expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  expect(consultas).toBe(1);
});

it('muestra el error de consulta y conserva los datos anteriores del pedido', async () => {
  const pedido: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [{ productoId: 19, cantidad: 1 }],
    total: 2500
  };

  server.use(
    http.get('*/pedidos/42', () =>
      HttpResponse.json({ error: 'NoEncontrado' }, { status: 404 })
    )
  );
  const user = userEvent.setup();

  render(<Confirmacion pedido={pedido} />);

  expect(screen.getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
  expect(screen.getByText('Pendiente')).toBeInTheDocument();
  expect(screen.getByText('$2.500')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Actualizar estado' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('NoEncontrado');
  expect(screen.getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
  expect(screen.getByText('Pendiente')).toBeInTheDocument();
  expect(screen.getByText('$2.500')).toBeInTheDocument();
});
