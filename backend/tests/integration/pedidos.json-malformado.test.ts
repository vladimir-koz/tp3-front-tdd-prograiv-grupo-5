import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('POST /pedidos con JSON malformado', () => {
    it('responde 400 con un error JSON sin guardar pedidos ni ítems', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const respuesta = await request(app)
                .post('/pedidos')
                .set('Content-Type', 'application/json')
                .send('{"mesa":7,"items":[{"productoId":19,"cantidad":1}]');

            expect(respuesta.status).toBe(400);
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedidos').get()).toEqual({ cantidad: 0 });
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedido_items').get()).toEqual({ cantidad: 0 });
            expect(respuesta.headers['content-type']).toMatch(/^application\/json\b/);
            expect(respuesta.body).toEqual(expect.objectContaining({ error: 'DatosInvalidos' }));
        } finally {
            db.close();
        }
    });
});
