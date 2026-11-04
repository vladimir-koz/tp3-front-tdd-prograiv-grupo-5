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

it('valida el filtrado mediano Colombia del catálogo oficial', () => {
  const respuestaApi: unknown = {
    id: 14,
    tipo: 'filtrado',
    nombre: 'Filtrado Mediano Colombia',
    precioBase: 3200,
    tamano: 'Mediano',
    gramos: 15,
    variedad: {
      id: 2,
      nombre: 'Colombia',
      precioPorGramo: 180,
      acidez: 'media',
      cuerpo: 'equilibrado',
      notas: 'cítricas y florales'
    },
    precio: 5900
  };

  const producto = ProductoSchema.parse(respuestaApi);

  expect(producto).toMatchObject({
    id: 14,
    tipo: 'filtrado',
    nombre: 'Filtrado Mediano Colombia',
    precio: 5900,
    tamano: 'Mediano',
    gramos: 15,
    variedad: {
      id: 2,
      nombre: 'Colombia',
      acidez: 'media',
      cuerpo: 'equilibrado',
      notas: 'cítricas y florales'
    }
  });
});

it('valida el muffin de chocolate sin campos de café', () => {
  const respuestaApi: unknown = {
    id: 19,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precioBase: 2500,
    precio: 2500
  };

  const producto = ProductoSchema.parse(respuestaApi);

  expect(producto).toMatchObject({
    id: 19,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precio: 2500
  });
});
