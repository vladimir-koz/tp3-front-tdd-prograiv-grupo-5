import { Router } from 'express';
import type Database from 'better-sqlite3';
import type { SqlitePedidoRepository } from '../repositories/PedidoRepository';
import type { PedidoService } from '../services/PedidoService';

export function makeTestRouter(pedidoRepo: SqlitePedidoRepository, pedidoService: PedidoService, db: Database.Database) {
    const router = Router();

    router.post('/reset', (_req, res) => {
      pedidoRepo.clear();
      res.sendStatus(204);
    });

    router.post('/seed', (_req, res) => {
      db.prepare('INSERT OR IGNORE INTO mesas (id) VALUES (4), (7)').run();
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
