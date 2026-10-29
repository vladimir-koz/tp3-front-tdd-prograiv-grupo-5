import { describe, expect, it } from 'vitest';
import { Pedido } from '../../src/models/Pedido';
import { Expreso, Filtrado, Pasteleria } from '../../src/models/Producto';
import type { Variedad } from '../../src/models/Variedad';

describe('Pedido.calcularTotal', () => {
    it('suma el precio calculado de cada producto multiplicado por su cantidad', () => {
        const colombia: Variedad = {
            id: 2,
            nombre: 'Colombia',
            precioPorGramo: 180,
            acidez: 'media',
            cuerpo: 'equilibrado',
            notas: 'cítricas y florales'
        };
        const etiopia: Variedad = {
            id: 3,
            nombre: 'Etiopía',
            precioPorGramo: 240,
            acidez: 'muy viva',
            cuerpo: 'ligero',
            notas: 'frutales'
        };
        const expreso = new Expreso(2, 'Expreso Pocillo Colombia', 2500, 'Pocillo', colombia);
        const filtrado = new Filtrado(18, 'Filtrado Taza grande Etiopía', 3200, 'Taza grande', etiopia);
        const muffin = new Pasteleria(19, 'Muffin de chocolate', 2500);
        const pedido = new Pedido(1, 7, 'pendiente', [
            { producto: expreso, cantidad: 2 },
            { producto: filtrado, cantidad: 1 },
            { producto: muffin, cantidad: 3 }
        ]);

        const total = pedido.calcularTotal();

        // 2 expresos de 5740 + 1 filtrado de 9200 + 3 muffins de 2500.
        expect(total).toBe(28180);
    });
});
