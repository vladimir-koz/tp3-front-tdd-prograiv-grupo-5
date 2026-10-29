import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { PedidoService } from '../services/PedidoService';

export function makePedidosRouter(servicio: PedidoService) {
    const router = Router();
    const controlador = new PedidoController(servicio);

    router.get('/', controlador.listar);
    router.get('/:id', controlador.obtenerPorId);
    router.post('/', controlador.crear);

    return router;
}