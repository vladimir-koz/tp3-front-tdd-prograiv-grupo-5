import { expect, it } from 'vitest';
import { ProductoSchema, ProductosSchema } from './schemas';

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

it('rechaza un producto con precio negativo', () => {
  const resultado = ProductoSchema.safeParse({
    id: 19,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precioBase: 2500,
    precio: -1
  });

  expect(resultado.success).toBe(false);
});

it('rechaza un producto con id igual a cero', () => {
  const resultado = ProductoSchema.safeParse({
    id: 0,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precioBase: 2500,
    precio: 2500
  });

  expect(resultado.success).toBe(false);
});

const productosValidos = [
  {
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
  },
  {
    id: 19,
    tipo: 'pasteleria',
    nombre: 'Muffin de chocolate',
    precioBase: 2500,
    precio: 2500
  }
];

it('acepta una lista con productos válidos de distintos tipos', () => {
  expect(ProductosSchema.safeParse(productosValidos).success).toBe(true);
});

it('rechaza una lista que contiene un producto inválido', () => {
  const respuestaApi = [productosValidos[0], { ...productosValidos[1], precio: -1 }];

  expect(ProductosSchema.safeParse(respuestaApi).success).toBe(false);
});

it('rechaza una respuesta de productos que no es un array', () => {
  expect(ProductosSchema.safeParse(productosValidos[0]).success).toBe(false);
});
