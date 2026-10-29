import { describe, it, expect, beforeEach } from 'vitest';
import { ProductoServiceImpl } from '../../src/services/ProductoService';
import { SqliteProductoRepository } from '../../src/repositories/ProductoRepository';
import { createDb } from '../../src/db/connection';
import { Expreso } from '../../src/models/Expreso';
import { Filtrado } from '../../src/models/Filtrado';
import { Pasteleria } from '../../src/models/Pasteleria';

describe('ProductoService - listarProductos', () => {
  let service: ProductoServiceImpl;

  beforeEach(() => {
    const db = createDb(':memory:');
    service = new ProductoServiceImpl(new SqliteProductoRepository(db));
  });

  it('devuelve el catálogo completo: 9 expresos, 9 filtrados y 2 de pastelería', () => {
    const productos = service.listarProductos();

    expect(productos).toHaveLength(20);
    expect(productos.filter((p) => p instanceof Expreso)).toHaveLength(9);
    expect(productos.filter((p) => p instanceof Filtrado)).toHaveLength(9);
    expect(productos.filter((p) => p instanceof Pasteleria)).toHaveLength(2);
  });

  it('los productos vienen ordenados por id', () => {
    const ids = service.listarProductos().map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('cada producto calcula el precio final de la tabla de la consigna', () => {
    const precios = Object.fromEntries(
      service.listarProductos().map((p) => [p.nombre, p.calcularPrecio()])
    );

    expect(precios).toEqual({
      'Expreso Pocillo Brasil': 5020,
      'Expreso Pocillo Colombia': 5740,
      'Expreso Pocillo Etiopía': 6820,
      'Expreso Mediano Brasil': 6280,
      'Expreso Mediano Colombia': 7360,
      'Expreso Mediano Etiopía': 8980,
      'Expreso Taza grande Brasil': 7540,
      'Expreso Taza grande Colombia': 8980,
      'Expreso Taza grande Etiopía': 11140,
      'Filtrado Pocillo Brasil': 4040,
      'Filtrado Pocillo Colombia': 4280,
      'Filtrado Pocillo Etiopía': 4640,
      'Filtrado Mediano Brasil': 5300,
      'Filtrado Mediano Colombia': 5900,
      'Filtrado Mediano Etiopía': 6800,
      'Filtrado Taza grande Brasil': 6700,
      'Filtrado Taza grande Colombia': 7700,
      'Filtrado Taza grande Etiopía': 9200,
      'Muffin de chocolate': 2500,
      'Porción de torta selva negra': 4200
    });
  });
});

describe('ProductoService - obtenerProducto', () => {
  let service: ProductoServiceImpl;

  beforeEach(() => {
    const db = createDb(':memory:');
    service = new ProductoServiceImpl(new SqliteProductoRepository(db));
  });

  it('devuelve el café pedido con su variedad completa', () => {
    const producto = service.obtenerProducto(1);

    expect(producto).toBeInstanceOf(Expreso);
    expect(producto).toMatchObject({
      id: 1,
      nombre: 'Expreso Pocillo Brasil',
      precioBase: 2500,
      tamano: 'Pocillo',
      variedad: {
        nombre: 'Brasil',
        precioPorGramo: 140,
        acidez: 'baja',
        cuerpo: 'denso',
        notas: 'avellana'
      }
    });
  });

  it('devuelve un producto de pastelería', () => {
    const producto = service.obtenerProducto(19);

    expect(producto).toBeInstanceOf(Pasteleria);
    expect(producto?.nombre).toBe('Muffin de chocolate');
    expect(producto?.calcularPrecio()).toBe(2500);
  });

  it('devuelve undefined cuando el id no existe', () => {
    expect(service.obtenerProducto(999)).toBeUndefined();
  });
});
