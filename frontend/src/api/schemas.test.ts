import { expect, it } from 'vitest';
import { ProductoSchema } from './schemas';

it('valida el producto 5 del catálogo oficial y conserva los campos que utiliza el menú', () => {
  const respuestaApi: unknown = {
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

  const producto = ProductoSchema.parse(respuestaApi);

  expect(producto).toMatchObject({
    id: 5,
    tipo: 'expreso',
    nombre: 'Expreso Mediano Colombia',
    precio: 7360,
    tamano: 'Mediano',
    gramos: 27,
    variedad: {
      id: 2,
      nombre: 'Colombia',
      acidez: 'media',
      cuerpo: 'equilibrado',
      notas: 'cítricas y florales'
    }
  });
});
