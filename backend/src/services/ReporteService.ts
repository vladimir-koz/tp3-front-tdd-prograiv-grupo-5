import type { PedidoConTotal } from '../models/Pedido.types';
import type { TipoProducto } from '../models/Producto';

export interface FuentePedidos {
  listarPedidos(): PedidoConTotal[];
}

export interface FuenteProductos {
  obtenerProducto(id: number): { tipo: TipoProducto } | undefined;
}

export interface TipoMasVendido {
  tipo: TipoProducto;
  cantidad: number;
}
export interface ReporteService {
  facturacionTotal(): number;
  cantidadVendidaPorTipo(): Record<string, number>;
  tipoMasVendido(): TipoMasVendido | undefined;
}

const ORDEN_TIPOS: TipoProducto[] = ['expreso', 'filtrado', 'pasteleria'];
const NOMBRES: Record<TipoProducto, string> = {
  expreso: 'Expreso',
  filtrado: 'Filtrado',
  pasteleria: 'Pastelería'
};


export class ReporteServiceImpl implements ReporteService {
  constructor(
    private readonly pedidos: FuentePedidos,
    private readonly productos: FuenteProductos
  ) {}


  facturacionTotal(): number {
    return this.pedidos.listarPedidos().reduce((suma, pedido) => suma + pedido.total, 0);
  }


  cantidadVendidaPorTipo(): Record<string, number> {
    const cantidades = this.contarPorTipo();
    const resultado: Record<string, number> = {};
    for (const tipo of ORDEN_TIPOS) {
      if (cantidades[tipo] > 0) resultado[NOMBRES[tipo]] = cantidades[tipo];
    }
    return resultado;
  }


  tipoMasVendido(): TipoMasVendido | undefined {
    const cantidades = this.contarPorTipo();
    let ganador: TipoMasVendido | undefined;
    for (const tipo of ORDEN_TIPOS) {
      const cantidad = cantidades[tipo];
      if (cantidad > 0 && (!ganador || cantidad > ganador.cantidad)) {
        ganador = { tipo, cantidad };
      }
    }
    return ganador;
  }

  private contarPorTipo(): Record<TipoProducto, number> {
    const cantidades: Record<TipoProducto, number> = {
      expreso: 0,
      filtrado: 0,
      pasteleria: 0
    };

    for (const pedido of this.pedidos.listarPedidos()) {
      for (const item of pedido.items) {
        const producto = this.productos.obtenerProducto(item.productoId);
        if (!producto) {
          throw new Error('No existe el producto con id ' + item.productoId);
        }
        cantidades[producto.tipo] += item.cantidad;
      }
    }

    return cantidades;
  }
}