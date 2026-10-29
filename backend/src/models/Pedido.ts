import type { Producto } from './Producto';

export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';

export interface ItemPedido {
    productoId: number;
    cantidad: number;
}

export interface NuevoPedido {
    mesa?: number | null;
    items: ItemPedido[];
}

export interface DatosPedido {
    id: number;
    mesa: number | null;
    items: ItemPedido[];
    estado: EstadoPedido;
}

export class Pedido {
    private readonly itemsInternos: { producto: Producto; cantidad: number }[];

    constructor(
        readonly id: number,
        readonly mesa: number | null,
        readonly estado: EstadoPedido,
        items: readonly { producto: Producto; cantidad: number }[]
    ) {
        this.itemsInternos = items.map(item => ({ ...item }));
    }

    get items(): { producto: Producto; cantidad: number }[] {
        return this.itemsInternos.map(item => ({ ...item }));
    }

    calcularTotal(): number {
        return this.itemsInternos.reduce(
            (total, item) => total + item.producto.calcularPrecio() * item.cantidad,
            0
        );
    }

    toJSON(): DatosPedido & { total: number } {
        return {
            id: this.id,
            mesa: this.mesa,
            estado: this.estado,
            items: this.itemsInternos.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad
            })),
            total: this.calcularTotal()
        };
    }
}
