import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';

describe('Regresión de creación y recuperación de pedidos', () => {
    it.each([
        { caso: 'con mesa', datosMesa: { mesa: 7 }, mesaEsperada: 7 },
        { caso: 'sin mesa', datosMesa: {}, mesaEsperada: null },
        { caso: 'con mesa null', datosMesa: { mesa: null }, mesaEsperada: null }
    ])('crea y recupera un pedido mixto $caso sin agrupar los ítems repetidos', async ({ datosMesa, mesaEsperada }) => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const items = [
                { productoId: 19, cantidad: 1 },
                { productoId: 2, cantidad: 2 },
                { productoId: 18, cantidad: 1 },
                { productoId: 2, cantidad: 1 }
            ];
            const esperado = {
                id: 1,
                mesa: mesaEsperada,
                estado: 'pendiente',
                items,
                // Muffin + 2 expresos Colombia + filtrado Etiopía + otro expreso.
                total: 2500 + 5740 * 2 + 9200 + 5740
            };

            const creacion = await request(app).post('/pedidos').send({ ...datosMesa, items });

            expect(creacion.status).toBe(201);
            expect(creacion.body).toEqual(esperado);

            const consulta = await request(app).get('/pedidos/1');
            expect(consulta.status).toBe(200);
            expect(consulta.body).toEqual(esperado);

            const listado = await request(app).get('/pedidos');
            expect(listado.status).toBe(200);
            expect(listado.body).toEqual([esperado]);
        } finally {
            db.close();
        }
    });

    it('recalcula el total al recuperar un pedido usando los precios actuales de sus productos', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const items = [
                { productoId: 2, cantidad: 2 },
                { productoId: 19, cantidad: 1 }
            ];
            const creacion = await request(app).post('/pedidos').send({ mesa: 7, items });

            expect(creacion.status).toBe(201);
            expect(creacion.body.total).toBe(5740 * 2 + 2500);

            // Cambia solo la base de prueba: Colombia pasa de 180 a 200 por gramo.
            db.prepare('UPDATE variedades SET precioPorGramo = ? WHERE id = ?').run(200, 2);

            const esperado = {
                id: 1,
                mesa: 7,
                estado: 'pendiente',
                items,
                // Cada expreso ahora cuesta 6100; el muffin conserva su precio.
                total: 6100 * 2 + 2500
            };
            const consulta = await request(app).get('/pedidos/1');
            expect(consulta.status).toBe(200);
            expect(consulta.body).toEqual(esperado);

            const listado = await request(app).get('/pedidos');
            expect(listado.status).toBe(200);
            expect(listado.body).toEqual([esperado]);
        } finally {
            db.close();
        }
    });

    it('rechaza un producto inexistente después de uno válido sin guardar el pedido ni sus ítems', async () => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const respuesta = await request(app).post('/pedidos').send({
                mesa: 7,
                items: [
                    { productoId: 19, cantidad: 2 },
                    { productoId: 999, cantidad: 1 }
                ]
            });

            expect(respuesta.status).toBe(400);
            expect(respuesta.body).toEqual({ error: 'ProductoInexistente', productoId: 999 });
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedidos').get()).toEqual({ cantidad: 0 });
            expect(db.prepare('SELECT COUNT(*) AS cantidad FROM pedido_items').get()).toEqual({ cantidad: 0 });
        } finally {
            db.close();
        }
    });

    it.each(['en_preparacion', 'entregado'])('conserva el estado almacenado %s al recuperar el pedido', async (estado) => {
        const db = createDb(':memory:');

        try {
            const app = makeApp(db);
            const items = [{ productoId: 19, cantidad: 2 }];
            const creacion = await request(app).post('/pedidos').send({ mesa: 7, items });
            expect(creacion.status).toBe(201);

            // Prepara un estado ya admitido por SQLite, sin añadir una operación HTTP.
            db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(estado, 1);

            const esperado = { id: 1, mesa: 7, estado, items, total: 5000 };
            const consulta = await request(app).get('/pedidos/1');
            expect(consulta.status).toBe(200);
            expect(consulta.body).toEqual(esperado);

            const listado = await request(app).get('/pedidos');
            expect(listado.status).toBe(200);
            expect(listado.body).toEqual([esperado]);
        } finally {
            db.close();
        }
    });
});
