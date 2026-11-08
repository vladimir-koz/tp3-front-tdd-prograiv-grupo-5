import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
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

  render(<Confirmacion pedido={pedido} />);

  expect(screen.getByRole('heading', { name: 'Pedido #42' })).toBeInTheDocument();
  expect(screen.getByText('Pendiente')).toBeInTheDocument();
  expect(screen.getByText('$17.220')).toBeInTheDocument();
});
