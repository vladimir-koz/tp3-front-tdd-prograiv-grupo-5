import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { obtenerProductos } from '../api/cliente';
import { ProductosSchema } from '../api/schemas';
import { server } from '../test/server';

const productoApi = {
  id: 5,
  tipo: 'expreso',
  nombre: 'Expreso Mediano Colombia',
  precioBase: 2500,
  tamano: 'Mediano',
  gramos: 27,
  variedad: {
    id: 2,
    nombre: 'Colombia',
    precioPorGramo: 180,
    acidez: 'media',
    cuerpo: 'equilibrado',
    notas: 'cítricas y florales'
  },
  precio: 7360
};

it('solicita GET /productos y devuelve los productos validados de una respuesta 200', async () => {
  let consultas = 0;
  server.use(
    http.get('*/productos', () => {
      consultas++;
      return HttpResponse.json([productoApi], { status: 200 });
    })
  );

  const productos = await obtenerProductos();

  expect(productos).toEqual(ProductosSchema.parse([productoApi]));
  expect(consultas).toBe(1);
});

it('rechaza una respuesta 200 que contiene un producto inválido', async () => {
  server.use(
    http.get('*/productos', () =>
      HttpResponse.json([{ ...productoApi, precio: -1 }], { status: 200 })
    )
  );

  await expect(obtenerProductos()).rejects.toThrow();
});

it('conserva el mensaje de la API cuando GET /productos responde 500', async () => {
  server.use(
    http.get('*/productos', () =>
      HttpResponse.json({ error: 'ErrorInterno' }, { status: 500 })
    )
  );

  await expect(obtenerProductos()).rejects.toThrow('ErrorInterno');
});

it('rechaza con un mensaje comprensible cuando falla la conexión', async () => {
  server.use(http.get('*/productos', () => HttpResponse.error()));

  await expect(obtenerProductos()).rejects.toThrow('No se pudo conectar con el servidor');
});
