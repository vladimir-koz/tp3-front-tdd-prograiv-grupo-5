import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('Errores internos de la API', () => {
    it('responde 500 con un error JSON sin exponer detalles internos de SQLite', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            // Provoca una falla real al consultar el catálogo, solo en esta base de prueba.
            db.exec('DROP TABLE productos');

            const respuesta = await request(app).get('/productos');

            expect(respuesta.status).toBe(500);
            expect.soft(respuesta.headers['content-type']).toMatch(/^application\/json\b/);
            expect.soft(respuesta.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
            expect.soft(respuesta.text).not.toMatch(
                /sqlite|no such table|\b(?:SELECT|FROM|JOIN)\b|\bstack\b|\bat\s+[^\n]*:\d+:\d+/i
            );
        } finally {
            db.close();
        }
    });
});
