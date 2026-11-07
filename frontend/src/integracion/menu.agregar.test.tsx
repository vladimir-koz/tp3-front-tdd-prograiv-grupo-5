import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCarrito } from '../carrito/CarritoContext';
import { catalogoApi } from '../test/fixtures';
import { renderizarApp } from '../test/renderizarApp';
import { server } from '../test/server';
import { elegirCafe } from '../test/utilidades';

// Muestra lo que guardó el contexto del carrito, para observarlo sin depender de la UI del minicart.
function VerCarrito() {
  const { items } = useCarrito();
  return <output aria-label="carrito">{items.map(p => p.nombre).join(', ')}</output>;
}

const carrito = () => screen.getByRole('status', { name: 'carrito' });

beforeEach(() => {
  server.use(http.get('*/productos', () => HttpResponse.json(catalogoApi)));
});

describe('menú completo', () => {
  it('muestra el selector de café y la pastelería cuando carga el catálogo', async () => {
    renderizarApp();

    expect(await screen.findByRole('region', { name: 'Café' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Pastelería' })).toBeInTheDocument();
  });

  it('agregar un producto de pastelería lo guarda en el carrito', async () => {
    const user = userEvent.setup();
    renderizarApp(<VerCarrito />);

    await user.click(await screen.findByRole('button', { name: 'Agregar Muffin de chocolate' }));

    expect(carrito()).toHaveTextContent('Muffin de chocolate');
  });

  it('agregar un café guarda el producto que corresponde a la elección', async () => {
    const user = userEvent.setup();
    renderizarApp(<VerCarrito />);

    await screen.findByRole('region', { name: 'Café' });
    await elegirCafe(user, 'Expreso', 'Mediano', 'Colombia');
    await user.click(screen.getByRole('button', { name: 'Agregar café' }));

    expect(carrito()).toHaveTextContent('Expreso Mediano Colombia');
  });
});
