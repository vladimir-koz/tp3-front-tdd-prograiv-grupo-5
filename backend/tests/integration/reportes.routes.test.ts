import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { makeReportesRouter } from '../../src/routes/reportes';
import type { ReporteService } from '../../src/services/ReporteService';

describe('GET /reportes/facturacion', () => {
    it('devuelve la facturación calculada por el servicio', async () => {
        const servicio: ReporteService = {
            facturacionTotal: () => 7500,
            cantidadVendidaPorTipo: () => ({}),
            tipoMasVendido: () => undefined
        };

        const app = express();
        app.use('/reportes', makeReportesRouter(servicio));

        const respuesta = await request(app).get('/reportes/facturacion');

        expect(respuesta.status).toBe(200);
        expect(respuesta.body).toEqual({ total: 7500 });
    });
});
describe('GET /reportes/mas-vendido', () => {
    it('devuelve el tipo más vendido y su cantidad', async () => {
        const servicio: ReporteService = {
            facturacionTotal: () => 0,
            cantidadVendidaPorTipo: () => ({}),
            tipoMasVendido: () => ({ tipo: 'expreso', cantidad: 3 })
        };

        const app = express();
        app.use('/reportes', makeReportesRouter(servicio));

        const respuesta = await request(app).get('/reportes/mas-vendido');

        expect(respuesta.status).toBe(200);
        expect(respuesta.body).toEqual({ tipo: 'expreso', cantidad: 3 });
    });
    it('responde 404 cuando no hay ventas', async () => {
        const servicio: ReporteService = {
            facturacionTotal: () => 0,
            cantidadVendidaPorTipo: () => ({}),
            tipoMasVendido: () => undefined
        };

        const app = express();
        app.use('/reportes', makeReportesRouter(servicio));

        const respuesta = await request(app).get('/reportes/mas-vendido');

        expect(respuesta.status).toBe(404);
        expect(respuesta.body).toEqual({ error: 'SinVentas' });
    });
});
describe('GET /reportes/cantidades', () => {
    it('devuelve las cantidades vendidas por tipo', async () => {
        const servicio: ReporteService = {
            facturacionTotal: () => 0,
            cantidadVendidaPorTipo: () => ({ Expreso: 3, Filtrado: 1 }),
            tipoMasVendido: () => undefined
        };

        const app = express();
        app.use('/reportes', makeReportesRouter(servicio));

        const respuesta = await request(app).get('/reportes/cantidades');

        expect(respuesta.status).toBe(200);
        expect(respuesta.body).toEqual({ Expreso: 3, Filtrado: 1 });
    });
});