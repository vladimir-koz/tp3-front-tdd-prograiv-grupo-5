import { describe, expect, it } from 'vitest';
import { createDb } from '../../src/db/connection';
import { SqlitePedidoRepository } from '../../src/repositories/PedidoRepository';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('SqlitePedidoRepository', () => {
    it('crea y recupera un pedido sin mesa con un item', () => {
        const db = createDb(':memory:');

        try {
            const repositorio = new SqlitePedidoRepository(db);
            const creado = repositorio.create({
                items: [{ productoId: 19, cantidad: 2 }]
        });

        expect(creado).toEqual({
            id: 1,
            mesa: null,
            items: [{ productoId: 19, cantidad: 2 }],
            estado: 'pendiente'
        });

        expect(repositorio.findById(1)).toEqual(creado);
        } finally {
        db.close();
        }
    });
    it('lista los pedidos después de cerrar y reabrir la base', () => {
        const carpeta = mkdtempSync(join(tmpdir(), 'cafeteria-'));
        const archivo = join(carpeta, 'pedidos.sqlite');

        try {
            const primeraConexion = createDb(archivo);
            try {
            const repositorio = new SqlitePedidoRepository(primeraConexion);
            repositorio.create({
                mesa: 7,
                items: [{ productoId: 1, cantidad: 1 }]
            });
            repositorio.create({
                items: [{ productoId: 19, cantidad: 2 }]
            });
            } finally {
            primeraConexion.close();
            }

            const segundaConexion = createDb(archivo);
            try {
                const repositorio = new SqlitePedidoRepository(segundaConexion);

                expect(repositorio.findAll()).toEqual([
                    {
                    id: 1,
                    mesa: 7,
                    items: [{ productoId: 1, cantidad: 1 }],
                    estado: 'pendiente'
                    },
                    {
                    id: 2,
                    mesa: null,
                    items: [{ productoId: 19, cantidad: 2 }],
                    estado: 'pendiente'
                    }
                ]);
            } finally {
                segundaConexion.close();
            }
            } finally {
                rmSync(carpeta, { recursive: true, force: true });
            }
    });
    it('devuelve todos los pedidos de una mesa y excluye los demas', () => {
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
                items: [{ productoId: 19, cantidad: 1 }]
            });
            repositorio.create({
                items: [{ productoId: 19, cantidad: 1 }]
            });

            expect(repositorio.findAll(7).map((pedido) => pedido.id))
                .toEqual([primero.id, segundo.id]);
        } finally {
            db.close();
        }
    });
});