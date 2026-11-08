import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDb } from '../../src/db/connection';

describe('Persistencia de mesas en createDb', () => {
    it('deja disponible la tabla mesas con un identificador entero', () => {
        const db = createDb(':memory:');

        try {
            expect(db.prepare('PRAGMA table_info(mesas)').all()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'id', type: 'INTEGER' })
                ])
            );
        } finally {
            db.close();
        }
    });

    it('carga inicialmente exactamente las mesas 1 a 25 y no registra la mesa 26', () => {
        const db = createDb(':memory:');

        try {
            const esperadas = Array.from({ length: 25 }, (_, indice) => ({ id: indice + 1 }));

            expect.soft(db.prepare('SELECT id FROM mesas ORDER BY id').all()).toEqual(esperadas);
            expect.soft(db.prepare('SELECT id FROM mesas WHERE id = ?').get(26)).toBeUndefined();
        } finally {
            db.close();
        }
    });

    it('permite insertar y consultar mesas de prueba', () => {
        const db = createDb(':memory:');

        try {
            const insertar = db.prepare('INSERT INTO mesas (id) VALUES (?)');
            insertar.run(101);
            insertar.run(205);

            expect(db.prepare('SELECT id FROM mesas WHERE id IN (101, 205) ORDER BY id').all())
                .toEqual([{ id: 101 }, { id: 205 }]);
        } finally {
            db.close();
        }
    });

    it('conserva pedidos e ítems al inicializar una base anterior sin mesas', () => {
        const carpeta = mkdtempSync(join(tmpdir(), 'cafeteria-mesas-'));
        const archivo = join(carpeta, 'anterior.sqlite');

        try {
            const anterior = new Database(archivo);
            try {
                anterior.pragma('foreign_keys = ON');
                anterior.exec(`
                    CREATE TABLE variedades (
                        id INTEGER PRIMARY KEY,
                        nombre TEXT NOT NULL UNIQUE,
                        precioPorGramo INTEGER NOT NULL,
                        acidez TEXT NOT NULL,
                        cuerpo TEXT NOT NULL,
                        notas TEXT NOT NULL
                    );
                    CREATE TABLE productos (
                        id INTEGER PRIMARY KEY,
                        tipo TEXT NOT NULL CHECK (tipo IN ('expreso', 'filtrado', 'pasteleria')),
                        nombre TEXT NOT NULL UNIQUE,
                        precioBase INTEGER NOT NULL,
                        tamano TEXT,
                        variedadId INTEGER REFERENCES variedades(id)
                    );
                    CREATE TABLE pedidos (
                        id INTEGER PRIMARY KEY,
                        mesa INTEGER CHECK (mesa IS NULL OR mesa > 0),
                        estado TEXT NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente', 'en_preparacion', 'entregado'))
                    );
                    CREATE TABLE pedido_items (
                        pedidoId INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
                        productoId INTEGER NOT NULL REFERENCES productos(id),
                        cantidad INTEGER NOT NULL CHECK (cantidad > 0)
                    );
                    INSERT INTO productos (id, tipo, nombre, precioBase)
                        VALUES (19, 'pasteleria', 'Muffin de prueba', 2500);
                    INSERT INTO pedidos (id, mesa, estado)
                        VALUES (12, 101, 'en_preparacion'), (18, NULL, 'entregado');
                    INSERT INTO pedido_items (pedidoId, productoId, cantidad)
                        VALUES (12, 19, 2), (18, 19, 1);
                `);
            } finally {
                anterior.close();
            }

            const db = createDb(archivo);
            try {
                expect(db.prepare('SELECT id, mesa, estado FROM pedidos ORDER BY id').all())
                    .toEqual([
                        { id: 12, mesa: 101, estado: 'en_preparacion' },
                        { id: 18, mesa: null, estado: 'entregado' }
                    ]);
                expect(db.prepare('SELECT pedidoId, productoId, cantidad FROM pedido_items ORDER BY rowid').all())
                    .toEqual([
                        { pedidoId: 12, productoId: 19, cantidad: 2 },
                        { pedidoId: 18, productoId: 19, cantidad: 1 }
                    ]);
            } finally {
                db.close();
            }
        } finally {
            rmSync(archivo, { force: true });
            rmdirSync(carpeta);
        }
    });

    it('conserva las mesas sin eliminar ni duplicar registros al inicializar otra vez', () => {
        const carpeta = mkdtempSync(join(tmpdir(), 'cafeteria-mesas-'));
        const archivo = join(carpeta, 'mesas.sqlite');

        try {
            const primeraConexion = createDb(archivo);
            let mesasIniciales: unknown[];
            try {
                const insertar = primeraConexion.prepare('INSERT INTO mesas (id) VALUES (?)');
                insertar.run(101);
                insertar.run(205);
                mesasIniciales = primeraConexion.prepare('SELECT id FROM mesas ORDER BY id').all();
            } finally {
                primeraConexion.close();
            }

            const segundaConexion = createDb(archivo);
            try {
                expect(segundaConexion.prepare('SELECT id FROM mesas ORDER BY id').all())
                    .toEqual(mesasIniciales);
            } finally {
                segundaConexion.close();
            }
        } finally {
            rmSync(archivo, { force: true });
            rmdirSync(carpeta);
        }
    });
});
