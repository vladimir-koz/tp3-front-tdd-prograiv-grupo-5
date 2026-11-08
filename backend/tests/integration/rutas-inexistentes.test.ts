import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('GET /ruta-inexistente', () => {
    it('responde 404 con un error JSON cuando la ruta no existe', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const respuesta = await request(app).get('/ruta-inexistente');

            expect(respuesta.status).toBe(404);
            expect(respuesta.headers['content-type']).toMatch(/^application\/json\b/);
            expect(respuesta.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
        } finally {
            db.close();
        }
    });
});
