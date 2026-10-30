import { Router } from 'express';
import type { SqlitePedidoRepository } from '../repositories/PedidoRepository';
import type { PedidoService } from '../services/PedidoService';

export function makeTestRouter(pedidoRepo: SqlitePedidoRepository, pedidoService: PedidoService) {
    const router = Router();

    router.post('/reset', (_req, res) => {
      pedidoRepo.clear();
      res.sendStatus(204);
    });

    router.post('/seed', (_req, res) => {
      const a = pedidoService.crearPedido({
        items: [
          { productoId: 2, cantidad: 2 }, // Expreso Pocillo Colombia
          { productoId: 19, cantidad: 1 } // Muffin de chocolate
        ]
      });
      const b = pedidoService.crearPedido({
        items: [{ productoId: 2, cantidad: 1 }],
        mesa: 7
      });
      res.status(201).json({ created: [a, b] });
    });

    return router;
}
