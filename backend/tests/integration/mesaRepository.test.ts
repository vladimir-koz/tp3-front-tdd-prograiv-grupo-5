import { describe, expect, it } from 'vitest';
import { createDb } from '../../src/db/connection';
import { SqliteMesaRepository } from '../../src/repositories/MesaRepository';

describe('SqliteMesaRepository', () => {
    it.each([
        { caso: 'registrada', id: 101, esperado: true },
        { caso: 'no registrada', id: 205, esperado: false }
    ])('devuelve $esperado para una mesa $caso', ({ id, esperado }) => {
        const db = createDb(':memory:');

        try {
            db.prepare('INSERT INTO mesas (id) VALUES (?)').run(101);
            const repositorio = new SqliteMesaRepository(db);

            expect(repositorio.existe(id)).toBe(esperado);
        } finally {
            db.close();
        }
    });
});
