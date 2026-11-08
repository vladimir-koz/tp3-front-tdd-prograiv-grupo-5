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

it('muestra un mensaje claro y permite reintentar si el catálogo no cumple el contrato', async () => {
  let consultas = 0;
  server.use(
    http.get('*/productos', () => {
      consultas++;
      if (consultas === 1) {
        return HttpResponse.json([
          { id: 19, tipo: 'pasteleria', nombre: 'Muffin de chocolate', precio: -1 }
        ]);
      }

      return HttpResponse.json([
        { id: 19, tipo: 'pasteleria', nombre: 'Muffin de chocolate', precioBase: 2500, precio: 2500 }
      ]);
    })
  );
  const user = userEvent.setup();

  renderizarApp();

  const alerta = await screen.findByRole('alert');
  expect(alerta).toHaveTextContent('La respuesta del servidor no tiene el formato esperado');
  expect(alerta).not.toHaveTextContent('too_small');
  expect(screen.queryByText('Muffin de chocolate')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Reintentar' }));

  expect(await screen.findByText('Muffin de chocolate')).toBeInTheDocument();
});

it('muestra que no se pudo conectar cuando la API está caída detrás del proxy', async () => {
  server.use(
    http.get('*/productos', () =>
      new HttpResponse(null, { status: 500, headers: { 'Content-Type': 'text/plain' } })
    )
  );

  renderizarApp();

  const alerta = await screen.findByRole('alert');
  expect(alerta).toHaveTextContent('No se pudo conectar con el servidor');
  expect(alerta).not.toHaveTextContent('JSON');
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
});
