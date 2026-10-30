import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('POST /pedidos con un charset no soportado', () => {
    it('responde 415 con un error JSON sin detalles internos ni datos persistidos', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const cuerpo = JSON.stringify({
                mesa: 4,
                items: [{ productoId: 19, cantidad: 1 }]
            });

            const respuesta = await request(app)
                .post('/pedidos')
                .set('Content-Type', 'application/json; charset=iso-8859-1')
                .send(cuerpo);

            expect(respuesta.status).toBe(415);
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedidos').get()).toEqual({ cantidad: 0 });
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedido_items').get()).toEqual({ cantidad: 0 });
            expect.soft(respuesta.headers['content-type']).toMatch(/^application\/json\b/);
            expect.soft(respuesta.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
            expect.soft(respuesta.text).not.toMatch(
                /UnsupportedMediaTypeError|body-parser|node_modules|\bstack\b|\bat\s+[^\n]*:\d+:\d+/i
            );
        } finally {
            db.close();
        }
    });
});
