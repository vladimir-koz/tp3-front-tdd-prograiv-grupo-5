export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';

export interface ItemPedidoPorId {
    productoId: number;
    cantidad: number;
}

export interface NuevoPedido {
    mesa?: number | null;
    items: ItemPedidoPorId[];
}

export interface PedidoPersistido {
    id: number;
    mesa: number | null;
    items: ItemPedidoPorId[];
    estado: EstadoPedido;
}

export interface PedidoConTotal extends PedidoPersistido {
    total: number;
}
