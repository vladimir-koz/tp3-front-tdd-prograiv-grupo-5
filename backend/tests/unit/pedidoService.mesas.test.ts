import { describe, expect, it, vi } from 'vitest';
import { PedidoService } from '../../src/services/PedidoService';
import { Pasteleria } from '../../src/models/Pasteleria';
import type { NuevoPedido, PedidoPersistido } from '../../src/models/Pedido.types';
import type { SqlitePedidoRepository } from '../../src/repositories/PedidoRepository';
import type { SqliteMesaRepository } from '../../src/repositories/MesaRepository';
import type { ProductoService } from '../../src/services/ProductoService';

function prepararServicio(mesaExiste: boolean) {
    const pedidos = {
        create: vi.fn((nuevo: NuevoPedido): PedidoPersistido => ({
            id: 1,
            mesa: nuevo.mesa ?? null,
            estado: 'pendiente',
            items: nuevo.items
        }))
    };
    const productos = {
        obtenerProducto: vi.fn().mockReturnValue(new Pasteleria(19, 'Muffin', 2500))
    };
    const mesas = { existe: vi.fn().mockReturnValue(mesaExiste) };
    const servicio = new PedidoService(
        pedidos as SqlitePedidoRepository,
        productos as ProductoService,
        mesas as SqliteMesaRepository
    );

    return { servicio, pedidos, mesas };
}

describe('PedidoService - existencia de mesas', () => {
    it('rechaza una mesa inexistente sin guardar el pedido', () => {
        const { servicio, pedidos } = prepararServicio(false);
        const nuevo = { mesa: 101, items: [{ productoId: 19, cantidad: 2 }] };

        expect.soft(() => servicio.crearPedido(nuevo)).toThrowError(
            expect.objectContaining({ name: 'MesaInexistenteError' })
        );
        expect.soft(pedidos.create).not.toHaveBeenCalled();
    });

    it('permite crear un pedido para una mesa existente', () => {
        const { servicio, pedidos, mesas } = prepararServicio(true);
        const nuevo = { mesa: 101, items: [{ productoId: 19, cantidad: 2 }] };

        expect(servicio.crearPedido(nuevo)).toEqual({
            id: 1,
            mesa: 101,
            estado: 'pendiente',
            items: nuevo.items,
            total: 5000
        });
        expect(pedidos.create).toHaveBeenCalledTimes(1);
        expect(pedidos.create).toHaveBeenCalledWith(nuevo);
        expect(mesas.existe).toHaveBeenCalledTimes(1);
        expect(mesas.existe).toHaveBeenCalledWith(101);
    });

    it.each([
        { caso: 'mesa null', datosMesa: { mesa: null } },
        { caso: 'mesa ausente', datosMesa: {} }
    ])('permite retiro en barra con $caso sin consultar mesas', ({ datosMesa }) => {
        const { servicio, pedidos, mesas } = prepararServicio(false);
        const nuevo = { ...datosMesa, items: [{ productoId: 19, cantidad: 2 }] };

        expect(servicio.crearPedido(nuevo)).toEqual({
            id: 1,
            mesa: null,
            estado: 'pendiente',
            items: nuevo.items,
            total: 5000
        });
        expect(pedidos.create).toHaveBeenCalledTimes(1);
        expect(pedidos.create).toHaveBeenCalledWith(nuevo);
        expect(mesas.existe).not.toHaveBeenCalled();
    });
});
