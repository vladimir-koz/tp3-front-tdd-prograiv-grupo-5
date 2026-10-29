export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';

export interface ItemPedido {
    productoId: number;
    cantidad: number;
}

export interface NuevoPedido {
    mesa?: number | null;
    items: ItemPedido[];
}

export interface Pedido {
    id: number;
    mesa: number | null;
    items: ItemPedido[];
    estado: EstadoPedido;
}