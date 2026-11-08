import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { renderizarApp } from '../renderizarApp';
import { server } from '../server';

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

  renderizarApp();

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Cargando menú');
  expect(screen.queryByText('Muffin de chocolate')).not.toBeInTheDocument();

  expect(await screen.findByText('Muffin de chocolate')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('muestra el error de carga y permite recuperar el catálogo al reintentar', async () => {
  let consultas = 0;
  server.use(
    http.get('*/productos', () => {
      consultas++;
      if (consultas === 1) {
        return HttpResponse.json({ error: 'ErrorInterno' }, { status: 500 });
      }

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
  const user = userEvent.setup();

  renderizarApp();

  expect(await screen.findByRole('alert')).toHaveTextContent('ErrorInterno');
  expect(consultas).toBe(1);

  await user.click(screen.getByRole('button', { name: 'Reintentar' }));

  expect(await screen.findByText('Muffin de chocolate')).toBeInTheDocument();
  expect(consultas).toBe(2);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
