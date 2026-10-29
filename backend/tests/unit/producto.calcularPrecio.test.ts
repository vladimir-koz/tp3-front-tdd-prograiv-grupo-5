import { describe, expect, it } from 'vitest';
import { Expreso, Filtrado, Pasteleria, Tamano } from '../../src/models/Producto';
import { Variedad } from '../../src/models/Variedad';

const brasil: Variedad = {
    id: 1,
    nombre: 'Brasil',
    precioPorGramo: 140,
    acidez: 'baja',
    cuerpo: 'denso',
    notas: 'avellana'
};

const colombia: Variedad = {
    id: 2,
    nombre: 'Colombia',
    precioPorGramo: 180,
    acidez: 'media',
    cuerpo: 'equilibrado',
    notas: 'citricas y florales'
};

const etiopia: Variedad = {
    id: 3,
    nombre: 'Etiopía',
    precioPorGramo: 240,
    acidez: 'muy viva',
    cuerpo: 'ligero',
    notas: 'frutales'
};

type Caso = [Tamano, Variedad, number];

const casosExpreso: Caso[] = [
    ['Pocillo', brasil, 5020],
    ['Pocillo', colombia, 5740],
    ['Pocillo', etiopia, 6820],
    ['Mediano', brasil, 6280],
    ['Mediano', colombia, 7360],
    ['Mediano', etiopia, 8980],
    ['Taza grande', brasil, 7540],
    ['Taza grande', colombia, 8980],
    ['Taza grande', etiopia, 11140],
];

const casosFiltrado: Caso[] = [
    ['Pocillo', brasil, 4040],
    ['Pocillo', colombia, 4280],
    ['Pocillo', etiopia, 4640],
    ['Mediano', brasil, 5300],
    ['Mediano', colombia, 5900],
    ['Mediano', etiopia, 6800],
    ['Taza grande', brasil, 6700],
    ['Taza grande', colombia, 7700],
    ['Taza grande', etiopia, 9200],
];

describe('Expreso.calcularPrecio', () => {
    for (const [tamano, variedad, esperado] of casosExpreso) {
        it(`${tamano} ${variedad.nombre} cuesta ${esperado}`, () => {
            const expreso = new Expreso(1, `Expreso ${tamano} ${variedad.nombre}`, 2500, tamano, variedad);
            expect(expreso.calcularPrecio()).toBe(esperado);
        });
    }
});

describe('Filtrado.calcularPrecio', () => {
    for (const [tamano, variedad, esperado] of casosFiltrado) {
        it(`${tamano} ${variedad.nombre} cuesta ${esperado}`, () => {
            const filtrado = new Filtrado(10, `Filtrado ${tamano} ${variedad.nombre}`, 3200, tamano, variedad);
            expect(filtrado.calcularPrecio()).toBe(esperado);
        });
    }
});


describe('Pasteleria.calcularPrecio', () => {
    it('muffin de chocolate cuesta 2500', () => {
        const muffin = new Pasteleria(19, 'Muffin de chocolate', 2500);
        expect(muffin.calcularPrecio()).toBe(2500);
    });

    it('torta selva negra cuesta 4200', () => {
        const torta = new Pasteleria(20, 'Torta selva negra', 4200);
        expect(torta.calcularPrecio()).toBe(4200);
    });
});

describe('tipo de producto', () => {
    it('Expreso se identifica como expreso', () => {
        expect(new Expreso(1, 'Expreso', 2500, 'Pocillo', brasil).tipo).toBe('expreso');
    });

    it('Filtrado se identifica como filtrado', () => {
        expect(new Filtrado(10, 'Filtrado', 3200, 'Pocillo', brasil).tipo).toBe('filtrado');
    });

    it('Pasteleria se identifica como pasteleria', () => {
        expect(new Pasteleria(19, 'Muffin', 2500).tipo).toBe('pasteleria');
    });
});