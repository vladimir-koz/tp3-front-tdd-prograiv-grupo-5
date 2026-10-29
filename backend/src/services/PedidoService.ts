import { Pedido } from '../models/Pedido';
import type { DatosPedido, NuevoPedido } from '../models/Pedido';
import type { Producto } from '../models/Producto';
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

    listarPedidos(mesa?: number): Array<DatosPedido & { total: number }> {
        return this.pedidos.findAll(mesa).map((pedido) => this.agregarTotal(pedido));
    }

    obtenerPedido(id: number): (DatosPedido & { total: number }) | undefined {
        const pedido = this.pedidos.findById(id);
        return pedido === undefined ? undefined : this.agregarTotal(pedido);
    }

    crearPedido(nuevo: NuevoPedido): DatosPedido & { total: number } {
        // Se valida todo antes de guardar, para no dejar pedidos a medias.
        const productos = new Map<number, Producto>();
        const items = nuevo.items.map(item => {
            let producto = productos.get(item.productoId);
            if (producto === undefined) {
                producto = this.productos.obtenerProducto(item.productoId);
                if (producto === undefined) {
                    throw new ProductoInexistenteError(item.productoId);
                }
                productos.set(item.productoId, producto);
            }
            return { producto, cantidad: item.cantidad };
        });

        const datos = this.pedidos.create(nuevo);
        return new Pedido(datos.id, datos.mesa, datos.estado, items).toJSON();
    }

    private agregarTotal(datos: DatosPedido): DatosPedido & { total: number } {
        const items = datos.items.map(item => {
            const producto = this.productos.obtenerProducto(item.productoId);
            if (producto === undefined) {
                throw new Error('Pedido guardado con producto inexistente');
            }
            return { producto, cantidad: item.cantidad };
        });

        return new Pedido(datos.id, datos.mesa, datos.estado, items).toJSON();
    }
}
