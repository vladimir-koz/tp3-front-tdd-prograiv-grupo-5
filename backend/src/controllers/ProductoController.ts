import { Request, Response } from 'express';
import { ProductoService } from '../services/ProductoService';

export class ProductoController {
  constructor(private readonly service: ProductoService) {}

  list = (_req: Request, res: Response) => {
    res.json(this.service.listarProductos());
  };

  getById = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const producto = this.service.obtenerProducto(id);
    if (!producto) return res.status(404).json({ error: 'NoEncontrado' });
    res.json(producto);
  };
}
