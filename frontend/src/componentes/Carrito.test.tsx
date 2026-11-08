import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { CarritoProvider } from '../carrito/CarritoContext';
import { Carrito } from './Carrito';

it('muestra el carrito vacío y no permite confirmar el pedido', () => {
  render(
    <CarritoProvider>
      <Carrito onConfirmar={vi.fn()} />
    </CarritoProvider>
  );

  expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
});
