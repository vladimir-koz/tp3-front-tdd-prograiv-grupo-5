import type Database from 'better-sqlite3';
import type {
    EstadoPedido,
    ItemPedido,
    NuevoPedido,
    DatosPedido
} from '../models/Pedido';

interface FilaPedido {
    id: number;
    mesa: number | null;
    estado: EstadoPedido;
}

export class SqlitePedidoRepository {
    constructor(private readonly db: Database.Database) {}

    create(nuevo: NuevoPedido): DatosPedido {
        const insertarPedido = this.db.prepare(
            'INSERT INTO pedidos (mesa) VALUES (?)'
        );
        const insertarItem = this.db.prepare(
            'INSERT INTO pedido_items (pedidoId, productoId, cantidad) VALUES (?, ?, ?)'
        );

        const id = this.db.transaction(() => {
            const resultado = insertarPedido.run(nuevo.mesa ?? null);
            const pedidoId = Number(resultado.lastInsertRowid);

            for (const item of nuevo.items) {
                insertarItem.run(pedidoId, item.productoId, item.cantidad);
            }

            return pedidoId;
        })();

        const creado = this.findById(id);
        if (creado === undefined) {
            throw new Error('No se pudo recuperar el pedido creado');
        }
        return creado;
    }

    findById(id: number): DatosPedido | undefined {
        const fila = this.db
        .prepare('SELECT id, mesa, estado FROM pedidos WHERE id = ?')
        .get(id) as FilaPedido | undefined;

        if (fila === undefined) {
            return undefined;
        }

        const items = this.db
        .prepare(
            'SELECT productoId, cantidad FROM pedido_items WHERE pedidoId = ? ORDER BY rowid'
        )
        .all(id) as ItemPedido[];

        return {
            id: fila.id,
            mesa: fila.mesa,
            estado: fila.estado,
            items
        };
    }
    findAll(mesa?: number): DatosPedido[] {
        const filas = (
            mesa === undefined
                ? this.db
                    .prepare('SELECT id, mesa, estado FROM pedidos ORDER BY id')
                    .all()
                : this.db
                    .prepare('SELECT id, mesa, estado FROM pedidos WHERE mesa = ? ORDER BY id')
                    .all(mesa)
        ) as FilaPedido[];

        const buscarItems = this.db.prepare(
            'SELECT productoId, cantidad FROM pedido_items WHERE pedidoId = ? ORDER BY rowid'
        );

        return filas.map((fila) => ({
            id: fila.id,
            mesa: fila.mesa,
            estado: fila.estado,
            items: buscarItems.all(fila.id) as ItemPedido[]
        }));
    }

    clear(): void {
        this.db.exec(`DELETE FROM pedido_items; DELETE FROM pedidos;`);
    }
}