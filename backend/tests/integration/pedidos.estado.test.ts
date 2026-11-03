import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('PATCH /pedidos/:id/estado', () => {
    it('cambia un pedido pendiente a en_preparacion y conserva sus datos', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const creado = await request(app)
                .post('/pedidos')
                .send({
                    mesa: 4,
                    items: [{ productoId: 19, cantidad: 2 }]
                });

            expect(creado.status).toBe(201);
            expect(creado.body).toEqual({
                id: expect.any(Number),
                mesa: 4,
                estado: 'pendiente',
                items: [{ productoId: 19, cantidad: 2 }],
                total: 5000
            });

            const esperado = { ...creado.body, estado: 'en_preparacion' };
            const actualizado = await request(app)
                .patch(`/pedidos/${creado.body.id}/estado`)
                .send({ estado: 'en_preparacion' });

            expect(actualizado.status).toBe(200);
            expect(actualizado.body).toEqual(esperado);

            const consultado = await request(app).get(`/pedidos/${creado.body.id}`);

            expect(consultado.status).toBe(200);
            expect(consultado.body).toEqual(esperado);
        } finally {
            db.close();
        }
    });
    it.each([
        { caso: 'estado cancelado', cuerpo: { estado: 'cancelado' } },
        { caso: 'sin estado', cuerpo: {} },
        { caso: 'propiedad adicional', cuerpo: { estado: 'en_preparacion', mesa: 7 } }
    ])('rechaza cuerpo inválido: $caso y conserva el estado original', async ({ cuerpo }) => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const creado = await request(app)
                .post('/pedidos')
                .send({
                    mesa: 4,
                    items: [{ productoId: 19, cantidad: 2 }]
                });

            expect(creado.status).toBe(201);
            expect(creado.body.estado).toBe('pendiente');

            const respuesta = await request(app)
                .patch(`/pedidos/${creado.body.id}/estado`)
                .send(cuerpo);
            const consultado = await request(app).get(`/pedidos/${creado.body.id}`);

            expect.soft(respuesta.status).toBe(400);
            expect.soft(respuesta.body).toEqual({ error: 'DatosInvalidos' });
            expect.soft(consultado.status).toBe(200);
            expect.soft(consultado.body.estado).toBe('pendiente');
        } finally {
            db.close();
        }
    });
    it.each([
        { id: 'abc', status: 400, error: 'DatosInvalidos' },
        { id: '0', status: 400, error: 'DatosInvalidos' },
        { id: '999', status: 404, error: 'NoEncontrado' }
    ])('rechaza el ID $id con $status sin alterar un pedido existente', async ({ id, status, error }) => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const creado = await request(app)
                .post('/pedidos')
                .send({
                    mesa: 4,
                    items: [{ productoId: 19, cantidad: 2 }]
                });

            expect(creado.status).toBe(201);
            expect(creado.body.estado).toBe('pendiente');

            const respuesta = await request(app)
                .patch(`/pedidos/${id}/estado`)
                .send({ estado: 'en_preparacion' });
            const consultado = await request(app).get(`/pedidos/${creado.body.id}`);

            expect.soft(respuesta.status).toBe(status);
            expect.soft(respuesta.body).toEqual({ error });
            expect.soft(consultado.status).toBe(200);
            expect.soft(consultado.body).toEqual(creado.body);
        } finally {
            db.close();
        }
    });
});
