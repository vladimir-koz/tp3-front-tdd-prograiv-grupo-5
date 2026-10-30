import express from 'express';
import type Database from 'better-sqlite3';
import { SqlitePedidoRepository } from './repositories/PedidoRepository';
import { PedidoService } from './services/PedidoService';
import { makePedidosRouter } from './routes/pedidos';
import { SqliteProductoRepository } from './repositories/ProductoRepository';
import { ProductoService } from './services/ProductoService';
import { makeProductosRouter } from './routes/productos';
import { ReporteServiceImpl } from './services/ReporteService';
import { makeReportesRouter } from './routes/reportes';

export function makeApp(db: Database.Database) {
    const app = express();
    app.use(express.json());
    const productoRepo = new SqliteProductoRepository(db);
    const pedidoRepo = new SqlitePedidoRepository(db);
    
    const productoService = new ProductoService(productoRepo);
    const pedidoService = new PedidoService(pedidoRepo, productoService);
    const reporteService = new ReporteServiceImpl(pedidoService, productoService);

    app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    app.use('/reportes', makeReportesRouter(reporteService));
    app.use('/productos', makeProductosRouter(productoService));
    app.use('/pedidos', makePedidosRouter(pedidoService));

    if (process.env.NODE_ENV === 'test') {
    app.post('/__test__/reset', (_req, res) => {
      pedidoRepo.clear();
      res.sendStatus(204);
    });

    app.post('/__test__/seed', (_req, res) => {
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
  }
    return app;
}