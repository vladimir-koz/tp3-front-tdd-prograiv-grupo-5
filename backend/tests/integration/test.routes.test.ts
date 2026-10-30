import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('Rutas exclusivas del entorno de pruebas', () => {
    it('responde 404 en reset y seed cuando la aplicación se construye en production', async () => {
        const db = createDb(':memory:');

        try {
            vi.stubEnv('NODE_ENV', 'production');
            const app = makeApp(db);

            const reset = await request(app).post('/__test__/reset');
            const seed = await request(app).post('/__test__/seed');

            expect(reset.status).toBe(404);
            expect(seed.status).toBe(404);
        } finally {
            vi.unstubAllEnvs();
            db.close();
        }
    });
});
