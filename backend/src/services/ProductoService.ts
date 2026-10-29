import { ProductoRepository } from '../repositories/ProductoRepository';
import { Producto } from '../models/Producto';

export interface ProductoService {
  listarProductos(): Producto[];
  obtenerProducto(id: number): Producto | undefined;
}

export class ProductoServiceImpl implements ProductoService {
  constructor(private readonly repo: ProductoRepository) {}

  listarProductos(): Producto[] {
    return this.repo.findAll();
  }

  obtenerProducto(id: number): Producto | undefined {
    return this.repo.findById(id);
  }
}
