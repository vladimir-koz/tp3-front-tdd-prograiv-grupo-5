import { Router } from 'express';
import { ProductoService } from '../services/ProductoService';
import { ProductoController } from '../controllers/ProductoController';

export function makeProductosRouter(service: ProductoService) {
  const router = Router();
  const controller = new ProductoController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.getById);

  return router;
}
