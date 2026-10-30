import { describe, it, expect, vi } from 'vitest';
import {
  ReporteServiceImpl,
  FuentePedidos,
  FuenteProductos
} from '../../src/services/ReporteService';
import type { PedidoConTotal } from '../../src/models/Pedido.types';

// ReporteService se prueba aislado: los servicios de los que depende se
// reemplazan por dobles (vi.fn) que devuelven pedidos ya armados.
function pedidoServiceCon(pedidos: PedidoConTotal[]): FuentePedidos {
  return {
    listarPedidos: vi.fn().mockReturnValue(pedidos)
  };
}

const productoService: FuenteProductos = {
  obtenerProducto: vi.fn()
};

describe('ReporteService - facturacionTotal', () => {
  it('es 0 cuando no hay pedidos', () => {
    const service = new ReporteServiceImpl(pedidoServiceCon([]), productoService);
    expect(service.facturacionTotal()).toBe(0);
  });

  it('es la suma de los totales de todos los pedidos', () => {
    const pedidos: PedidoConTotal[] = [
      { id: 1, mesa: null, items: [{ productoId: 19, cantidad: 2 }], estado: 'entregado', total: 5000 },
      { id: 2, mesa: 7, items: [{ productoId: 1, cantidad: 1 }], estado: 'pendiente', total: 5020 },
      { id: 3, mesa: 7, items: [{ productoId: 20, cantidad: 3 }], estado: 'en_preparacion', total: 12600 }
    ];
    const pedidoService = pedidoServiceCon(pedidos);
    const service = new ReporteServiceImpl(pedidoService, productoService);

    expect(service.facturacionTotal()).toBe(5000 + 5020 + 12600);
    expect(pedidoService.listarPedidos).toHaveBeenCalledOnce();
  });
});