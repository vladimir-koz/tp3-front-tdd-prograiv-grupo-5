import { renderHook, waitFor } from '@testing-library/react';
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
