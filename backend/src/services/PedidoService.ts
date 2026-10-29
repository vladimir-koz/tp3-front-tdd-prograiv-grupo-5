import type { ItemPedido, NuevoPedido, Pedido } from '../models/Pedido';
import { SqlitePedidoRepository } from '../repositories/PedidoRepository';
import type { ProductoService } from './ProductoService';

export class ProductoInexistenteError extends Error {
  constructor(readonly productoId: number) {
    super(`No existe el producto con id ${productoId}`);
    this.name = 'ProductoInexistenteError';
  }
}
export class PedidoService {
    constructor(
        private readonly pedidos: SqlitePedidoRepository,
        private readonly productos: ProductoService
    ) {}

    listarPedidos(mesa?: number): Array<Pedido & { total: number }> {
        return this.pedidos.findAll(mesa).map((pedido) => this.agregarTotal(pedido));
    }

    obtenerPedido(id: number): (Pedido & { total: number }) | undefined {
        const pedido = this.pedidos.findById(id);
        return pedido === undefined ? undefined : this.agregarTotal(pedido);
    }

    crearPedido(nuevo: NuevoPedido): (Pedido & { total: number }) | undefined {
        // Se valida todo antes de guardar, para no dejar pedidos a medias.
        for (const item of nuevo.items) {
        if (!this.productos.obtenerProducto(item.productoId)) {
            throw new ProductoInexistenteError(item.productoId);
        }
        }
        const total = this.calcularTotal(nuevo.items);
        if (total === undefined) return undefined;

        const pedido = this.pedidos.create(nuevo);
        return { ...pedido, total };
    }

    private agregarTotal(pedido: Pedido): Pedido & { total: number } {
        const total = this.calcularTotal(pedido.items);
        if (total === undefined) {
            throw new Error('Pedido guardado con producto inexistente');
        }
        return { ...pedido, total };
    }

    private calcularTotal(items: ItemPedido[]): number | undefined {
        let total = 0;

        for (const item of items) {
            const producto = this.productos.obtenerProducto(item.productoId);
            if (producto === undefined) return undefined;
            total += producto.calcularPrecio() * item.cantidad;
        }

        return total;
    }
}