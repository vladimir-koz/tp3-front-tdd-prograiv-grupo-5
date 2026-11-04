import { render, screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { App } from '../App';
import { server } from '../test/server';

it('muestra un indicador mientras carga el catálogo y después presenta los productos', async () => {
  server.use(
    http.get('*/productos', async () => {
      await delay(100);
      return HttpResponse.json([
        {
          id: 19,
          tipo: 'pasteleria',
          nombre: 'Muffin de chocolate',
          precioBase: 2500,
          precio: 2500
        }
      ]);
    })
  );

  render(<App />);

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Cargando menú');
  expect(screen.queryByText('Muffin de chocolate')).not.toBeInTheDocument();

  expect(await screen.findByText('Muffin de chocolate')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
