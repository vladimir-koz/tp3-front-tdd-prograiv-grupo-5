import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { server } from '../test/server';
import { useMenu } from './useMenu';

it('comienza cargando y pasa a listo con los productos validados', async () => {
  server.use(
    http.get('*/productos', () =>
      HttpResponse.json([
        {
          id: 19,
          tipo: 'pasteleria',
          nombre: 'Muffin de chocolate',
          precioBase: 2500,
          precio: 2500
        }
      ])
    )
  );

  const { result } = renderHook(() => useMenu());

  expect(result.current.estado).toEqual({ estado: 'cargando' });

  await waitFor(() => {
    expect(result.current.estado).toEqual({
      estado: 'listo',
      productos: [
        { id: 19, tipo: 'pasteleria', nombre: 'Muffin de chocolate', precio: 2500 }
      ]
    });
  });
});

it('comienza cargando y pasa a error con el mensaje de la API ante un HTTP 500', async () => {
  server.use(
    http.get('*/productos', () =>
      HttpResponse.json({ error: 'ErrorInterno' }, { status: 500 })
    )
  );

  const { result } = renderHook(() => useMenu());

  expect(result.current.estado).toEqual({ estado: 'cargando' });

  await waitFor(() => {
    expect(result.current.estado).toEqual({ estado: 'error', mensaje: 'ErrorInterno' });
  });
});

it('permite reintentar después de un error y cargar los productos', async () => {
  const producto = {
    id: 19,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precio: 2500
  };
  server.use(
    http.get('*/productos', () =>
      HttpResponse.json({ error: 'ErrorInterno' }, { status: 500 })
    )
  );

  const { result } = renderHook(() => useMenu());

  await waitFor(() => {
    expect(result.current.estado).toEqual({ estado: 'error', mensaje: 'ErrorInterno' });
  });

  server.use(
    http.get('*/productos', () =>
      HttpResponse.json([{ ...producto, precioBase: 2500 }], { status: 200 })
    )
  );

  act(() => {
    result.current.reintentar();
  });

  expect(result.current.estado).toEqual({ estado: 'cargando' });

  await waitFor(() => {
    expect(result.current.estado).toEqual({ estado: 'listo', productos: [producto] });
  });
});
