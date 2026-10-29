import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';
import { SqlitePedidoRepository } from '../../src/repositories/PedidoRepository';

describe('GET /pedidos', () => {
    it('devuelve solamente los pedidos de la mesa solicitada', async () => {
        const db = createDb(':memory:');

        try {
            const repositorio = new SqlitePedidoRepository(db);
            const primero = repositorio.create({
                mesa: 7,
                items: [{ productoId: 19, cantidad: 1 }]
            });
            repositorio.create({
                mesa: 4,
                items: [{ productoId: 19, cantidad: 1 }]
            });
            const segundo = repositorio.create({
                mesa: 7,
                items: [{ productoId: 19, cantidad: 2 }]
            });
            repositorio.create({
                items: [{ productoId: 19, cantidad: 1 }]
            });

            const respuesta = await request(makeApp(db)).get('/pedidos?mesa=7');

            expect(respuesta.status).toBe(200);
            expect(respuesta.body).toMatchObject([
                { id: primero.id, mesa: 7 },
                { id: segundo.id, mesa: 7 }
            ]);
        } finally {
            db.close();
        }
    });
    it.each(['0', 'abc'])('rechaza mesa inválida: %s', async (mesa) => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db))
                .get('/pedidos')
                .query({ mesa });

            expect(respuesta.status).toBe(400);
        } finally {
            db.close();
        }
    });
    it('lista todos los pedidos cuando no se indica mesa', async () => {
        const db = createDb(':memory:');

        try {
            const repositorio = new SqlitePedidoRepository(db);
            const primero = repositorio.create({
                mesa: 7,
                items: [{ productoId: 19, cantidad: 1 }]
            });
            const segundo = repositorio.create({
                items: [{ productoId: 19, cantidad: 2 }]
            });

            const respuesta = await request(makeApp(db)).get('/pedidos');

            expect(respuesta.status).toBe(200);
            expect(respuesta.body).toMatchObject([
                { ...primero, total: 2500 },
                { ...segundo, total: 5000 }
            ]);
        } finally {
            db.close();
        }
    });
});
describe('GET /pedidos/:id', () => {
    it('devuelve el pedido solicitado por su ID', async () => {
        const db = createDb(':memory:');

        try {
            const repositorio = new SqlitePedidoRepository(db);
            const creado = repositorio.create({
                mesa: 7,
                items: [{ productoId: 19, cantidad: 2 }]
            });

            const respuesta = await request(makeApp(db))
                .get(`/pedidos/${creado.id}`);

            expect(respuesta.status).toBe(200);
            expect(respuesta.body).toMatchObject({ ...creado, total: 5000 });
        } finally {
            db.close();
        }
    });
    it.each(['0', 'abc'])('rechaza el ID inválido: %s', async (id) => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db))
                .get(`/pedidos/${id}`);

            expect(respuesta.status).toBe(400);
        } finally {
            db.close();
        }
    });
    it('responde 404 si el ID válido no existe', async () => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db)).get('/pedidos/999');

            expect(respuesta.status).toBe(404);
        } finally {
            db.close();
        }
    });
});
describe('POST /pedidos', () => {
    it('crea y guarda un pedido pendiente con mesa', async () => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db))
                .post('/pedidos')
                .send({
                    mesa: 7,
                    items: [{ productoId: 19, cantidad: 2 }]
                });

            expect(respuesta.status).toBe(201);
            expect(respuesta.body).toMatchObject({
                id: 1,
                mesa: 7,
                items: [{ productoId: 19, cantidad: 2 }],
                estado: 'pendiente',
                total:5000
            });

            const repositorio = new SqlitePedidoRepository(db);
            expect(repositorio.findById(1)).toMatchObject({
                mesa: 7,
                items: [{ productoId: 19, cantidad: 2 }],
                estado: 'pendiente'
            });
        } finally {
            db.close();
        }
    });
    it('rechaza un pedido sin ítems y no guarda nada', async () => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db))
                .post('/pedidos')
                .send({ mesa: 7, items: [] });

            expect(respuesta.status).toBe(400);
            expect(new SqlitePedidoRepository(db).findAll()).toEqual([]);
        } finally {
            db.close();
        }
    });
    it('rechaza un producto inexistente y no guarda el pedido', async () => {
        const db = createDb(':memory:');

        try {
            const respuesta = await request(makeApp(db))
                .post('/pedidos')
                .send({ items: [{ productoId: 999, cantidad: 1 }] });

            expect(respuesta.status).toBe(400);
            expect(new SqlitePedidoRepository(db).findAll()).toEqual([]);
        } finally {
            db.close();
        }
    });
});