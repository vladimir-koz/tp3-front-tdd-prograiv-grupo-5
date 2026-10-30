import { describe, it, expect, vi } from 'vitest';
import {
  ReporteServiceImpl,
  FuentePedidos,
  FuenteProductos
} from '../../src/services/ReporteService';
import type { PedidoConTotal } from '../../src/models/Pedido.types';
import type { TipoProducto } from '../../src/models/Producto';

// Productos falsos armados dentro del test: solo aportan id y tipo.
const catalogo: { id: number; tipo: TipoProducto }[] = [
  { id: 1, tipo: 'expreso' },
  { id: 2, tipo: 'expreso' },
  { id: 14, tipo: 'filtrado' },
  { id: 19, tipo: 'pasteleria' },
  { id: 20, tipo: 'pasteleria' }
];

const productoService: FuenteProductos = {
  obtenerProducto: vi.fn((id: number) => catalogo.find((p) => p.id === id))
};

// El total no importa para estos reportes: solo cuentan las cantidades.
function pedido(id: number, items: PedidoConTotal['items']): PedidoConTotal {
  return { id, mesa: null, items, estado: 'pendiente', total: 0 };
}

function serviceCon(pedidos: PedidoConTotal[]) {
  const pedidoService: FuentePedidos = {
    listarPedidos: vi.fn().mockReturnValue(pedidos)
  };
  return new ReporteServiceImpl(pedidoService, productoService);
}

describe('ReporteService - cantidadVendidaPorTipo', () => {
  it('devuelve un objeto vacío cuando no hay pedidos', () => {
    expect(serviceCon([]).cantidadVendidaPorTipo()).toEqual({});
  });

  it('suma las cantidades de cada tipo entre todos los pedidos', () => {
    const service = serviceCon([
      pedido(1, [
        { productoId: 2, cantidad: 3 },
        { productoId: 19, cantidad: 1 }
      ]),
      pedido(2, [{ productoId: 2, cantidad: 7 }]),
      pedido(3, [
        { productoId: 14, cantidad: 4 },
        { productoId: 19, cantidad: 2 }
      ])
    ]);

    expect(service.cantidadVendidaPorTipo()).toEqual({
      Expreso: 10,
      Filtrado: 4,
      Pastelería: 3
    });
  });

  it('el mismo producto repetido dentro de un pedido también se suma', () => {
    const service = serviceCon([
      pedido(1, [
        { productoId: 19, cantidad: 1 },
        { productoId: 19, cantidad: 2 }
      ])
    ]);

    expect(service.cantidadVendidaPorTipo()).toEqual({ Pastelería: 3 });
  });

  it('agrupa distintas variantes de café y los dos productos de pastelería', () => {
    const service = serviceCon([
      pedido(1, [
        { productoId: 1, cantidad: 2 },
        { productoId: 2, cantidad: 3 },
        { productoId: 19, cantidad: 1 },
        { productoId: 20, cantidad: 4 }
      ])
    ]);

    expect(service.cantidadVendidaPorTipo()).toEqual({ Expreso: 5, Pastelería: 5 });
  });

  it('lanza un error explícito si un ítem apunta a un producto inexistente', () => {
    const service = serviceCon([pedido(1, [{ productoId: 999, cantidad: 1 }])]);

    expect(() => service.cantidadVendidaPorTipo()).toThrow('No existe el producto con id 999');
  });
});

describe('ReporteService - tipoMasVendido', () => {
  it('devuelve undefined cuando no hay ventas', () => {
    expect(serviceCon([]).tipoMasVendido()).toBeUndefined();
  });

  it('devuelve el tipo con mayor cantidad vendida', () => {
    const service = serviceCon([
      pedido(1, [
        { productoId: 2, cantidad: 3 },
        { productoId: 14, cantidad: 4 }
      ]),
      pedido(2, [{ productoId: 2, cantidad: 7 }])
    ]);

    expect(service.tipoMasVendido()).toEqual({
      tipo: 'expreso',
      cantidad: 10
    });
  });

  it('ante un empate usa el orden Expreso, Filtrado, Pastelería', () => {
    const service = serviceCon([
      pedido(1, [{ productoId: 19, cantidad: 5 }]),
      pedido(2, [{ productoId: 14, cantidad: 5 }])
    ]);

    expect(service.tipoMasVendido()).toEqual({ tipo: 'filtrado', cantidad: 5 });
  });
});