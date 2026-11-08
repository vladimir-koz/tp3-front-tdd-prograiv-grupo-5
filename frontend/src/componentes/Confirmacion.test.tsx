import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { Pedido } from '../api/schemas';
import { Confirmacion } from './Confirmacion';

it('muestra el número, estado y total del pedido recibido de la API', () => {
  const pedido: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [
      { productoId: 5, cantidad: 2 },
      { productoId: 19, cantidad: 1 }
    ],
    total: 17220
  };

  render(<Confirmacion pedido={pedido} onNuevoPedido={() => {}} />);

  expect(screen.getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
  expect(screen.getByText('Pendiente')).toBeInTheDocument();
  expect(screen.getByText('$17.220')).toBeInTheDocument();
});

it('ofrece hacer otro pedido y avisa al hacer clic', async () => {
  const pedido: Pedido = {
    id: 42,
    mesa: 4,
    estado: 'pendiente',
    items: [{ productoId: 19, cantidad: 1 }],
    total: 2500
  };
  const onNuevoPedido = vi.fn();
  const user = userEvent.setup();

  render(<Confirmacion pedido={pedido} onNuevoPedido={onNuevoPedido} />);

  await user.click(screen.getByRole('button', { name: 'Hacer otro pedido' }));

  expect(onNuevoPedido).toHaveBeenCalledTimes(1);
});
