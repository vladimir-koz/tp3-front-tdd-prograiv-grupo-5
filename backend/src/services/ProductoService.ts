import { SqliteProductoRepository } from '../repositories/ProductoRepository';
import { Producto } from '../models/Producto';

export class ProductoService {
  constructor(private readonly repo: SqliteProductoRepository) {}

  listarProductos(): Producto[] {
    return this.repo.findAll();
  }

  obtenerProducto(id: number): Producto | undefined {
    return this.repo.findById(id);
  }
}
