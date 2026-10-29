import type Database from 'better-sqlite3';
import { Producto } from '../models/Producto';
import type { Tamano } from '../models/Cafe';
import { Expreso } from '../models/Expreso';
import { Filtrado } from '../models/Filtrado';
import { Pasteleria } from '../models/Pasteleria';
import { Variedad } from '../models/Variedad';

// Contrato del repositorio de productos: el catálogo es de solo lectura.
export interface ProductoRepository {
  findAll(): Producto[];
  findById(id: number): Producto | undefined;
}

const SELECT_PRODUCTOS = `
  SELECT p.id, p.tipo, p.nombre, p.precioBase, p.tamano,
         v.id AS variedadId, v.nombre AS variedadNombre, v.precioPorGramo,
         v.acidez, v.cuerpo, v.notas
  FROM productos p
  LEFT JOIN variedades v ON v.id = p.variedadId
`;

export class SqliteProductoRepository implements ProductoRepository {
  constructor(private readonly db: Database.Database) {}

  findAll(): Producto[] {
    const rows = this.db.prepare(`${SELECT_PRODUCTOS} ORDER BY p.id`).all() as ProductoRow[];
    return rows.map(rowToProducto);
  }

  findById(id: number): Producto | undefined {
    const row = this.db.prepare(`${SELECT_PRODUCTOS} WHERE p.id = ?`).get(id) as ProductoRow | undefined;
    return row ? rowToProducto(row) : undefined;
  }
}

// La librería devuelve filas sin tipo de dominio; describimos su forma aquí.
interface ProductoRow {
  id: number;
  tipo: string;
  nombre: string;
  precioBase: number;
  tamano: string | null;
  variedadId: number | null;
  variedadNombre: string | null;
  precioPorGramo: number | null;
  acidez: string | null;
  cuerpo: string | null;
  notas: string | null;
}

function esTamano(valor: string | null): valor is Tamano {
  return valor === 'Pocillo' || valor === 'Mediano' || valor === 'Taza grande';
}

// Convierte cada fila en la subclase correspondiente.
function rowToProducto(row: ProductoRow): Producto {
  if (row.tipo === 'pasteleria') {
    return new Pasteleria(row.id, row.nombre, row.precioBase);
  }

  if (row.tipo !== 'expreso' && row.tipo !== 'filtrado') {
    throw new Error('Tipo de producto desconocido: ' + row.tipo);
  }

  if (
    !esTamano(row.tamano) ||
    row.variedadId === null ||
    row.variedadNombre === null ||
    row.precioPorGramo === null ||
    row.acidez === null ||
    row.cuerpo === null ||
    row.notas === null
  ) {
    throw new Error('Datos de café incompletos para el producto ' + row.id);
  }

  const variedad: Variedad = {
    id: row.variedadId,
    nombre: row.variedadNombre,
    precioPorGramo: row.precioPorGramo,
    acidez: row.acidez,
    cuerpo: row.cuerpo,
    notas: row.notas
  };

  if (row.tipo === 'expreso') {
    return new Expreso(row.id, row.nombre, row.precioBase, row.tamano, variedad);
  }
  return new Filtrado(row.id, row.nombre, row.precioBase, row.tamano, variedad);
}
