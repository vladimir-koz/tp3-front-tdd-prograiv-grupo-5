import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { CarritoProvider, useCarrito } from '../carrito/CarritoContext';
import { productos } from '../test/fixtures';
import { Carrito } from './Carrito';

function AgregarMuffin() {
  const { agregar } = useCarrito();

  return <button onClick={() => agregar(productos[18])}>Agregar muffin de prueba</button>;
}

it('muestra el carrito vacío y no permite confirmar el pedido', () => {
  render(
    <CarritoProvider>
      <Carrito onConfirmar={vi.fn()} />
    </CarritoProvider>
  );

  expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
});

it('muestra el producto agrupado, su cantidad y los subtotales orientativos', async () => {
  const user = userEvent.setup();
  render(
    <CarritoProvider>
      <AgregarMuffin />
      <Carrito onConfirmar={vi.fn()} />
    </CarritoProvider>
  );

  const agregar = screen.getByRole('button', { name: 'Agregar muffin de prueba' });
  await user.click(agregar);
  await user.click(agregar);

  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  const item = screen.getByRole('listitem', { name: 'Muffin de chocolate' });
  expect(within(item).getByText('Muffin de chocolate')).toBeInTheDocument();
  expect(within(item).getByText('2')).toBeInTheDocument();
  expect(within(item).getByText('$5.000')).toBeInTheDocument();
  expect(screen.getByText('Subtotal orientativo').parentElement).toHaveTextContent('$5.000');
  expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeEnabled();
});

it('permite sumar, restar y quitar el producto desde los controles del carrito', async () => {
  const user = userEvent.setup();
  render(
    <CarritoProvider>
      <AgregarMuffin />
      <Carrito onConfirmar={vi.fn()} />
    </CarritoProvider>
  );

  const agregar = screen.getByRole('button', { name: 'Agregar muffin de prueba' });
  await user.click(agregar);
  await user.click(agregar);

  const item = screen.getByRole('listitem', { name: 'Muffin de chocolate' });
  expect(within(item).getByText('2')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Sumar Muffin de chocolate' }));
  expect(within(item).getByText('3')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Restar Muffin de chocolate' }));
  expect(within(item).getByText('2')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Quitar Muffin de chocolate' }));
  expect(screen.queryByRole('listitem', { name: 'Muffin de chocolate' })).not.toBeInTheDocument();
  expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
});
