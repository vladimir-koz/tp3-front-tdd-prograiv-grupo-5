import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('POST /pedidos con un cuerpo demasiado grande', () => {
    it('responde 413 con un error JSON sin detalles internos ni datos persistidos', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const cuerpo = JSON.stringify({
                mesa: 7,
                items: Array.from({ length: 4000 }, () => ({ productoId: 19, cantidad: 1 }))
            });
            // express.json() utiliza actualmente su límite predeterminado de 100 KiB.
            expect(Buffer.byteLength(cuerpo, 'utf8')).toBeGreaterThan(100 * 1024);

            const respuesta = await request(app)
                .post('/pedidos')
                .set('Content-Type', 'application/json')
                .send(cuerpo);

            expect(respuesta.status).toBe(413);
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedidos').get()).toEqual({ cantidad: 0 });
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedido_items').get()).toEqual({ cantidad: 0 });
            expect.soft(respuesta.headers['content-type']).toMatch(/^application\/json\b/);
            expect.soft(respuesta.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
            expect.soft(respuesta.text).not.toMatch(
                /PayloadTooLargeError|raw-body|body-parser|node_modules|\bstack\b|\bat\s+[^\n]*:\d+:\d+/i
            );
        } finally {
            db.close();
        }
    });
});
