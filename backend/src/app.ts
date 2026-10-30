import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import type Database from 'better-sqlite3';
import { SqlitePedidoRepository } from './repositories/PedidoRepository';
import { PedidoService } from './services/PedidoService';
import { makePedidosRouter } from './routes/pedidos';
import { SqliteProductoRepository } from './repositories/ProductoRepository';
import { ProductoService } from './services/ProductoService';
import { makeProductosRouter } from './routes/productos';
import { ReporteServiceImpl } from './services/ReporteService';
import { makeReportesRouter } from './routes/reportes';
import { makeTestRouter } from './routes/test';

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
        app.use('/__test__', makeTestRouter(pedidoRepo, pedidoService));
    }
    app.use(notFound);
    app.use(errorHandler);
    return app;
}