import type { Bebida, Cafe, Pasteleria, Producto, Tamano, Variedad } from '../api/schemas';

export const BEBIDAS: { valor: Bebida; etiqueta: string }[] = [
  { valor: 'expreso', etiqueta: 'Expreso' },
  { valor: 'filtrado', etiqueta: 'Filtrado' }
];

export const TAMANOS: Tamano[] = ['Pocillo', 'Mediano', 'Taza grande'];

// Orden en que la consigna presenta los orígenes.
const ORDEN_ORIGENES = ['Colombia', 'Etiopía', 'Brasil'];

export interface Eleccion {
  bebida?: Bebida;
  tamano?: Tamano;
  origen?: string;
}

export function esCafe(producto: Producto): producto is Cafe {
  return producto.tipo === 'expreso' || producto.tipo === 'filtrado';
}

export function esPasteleria(producto: Producto): producto is Pasteleria {
  return producto.tipo === 'pasteleria';
}

export function buscarCafe(productos: Producto[], eleccion: Eleccion): Cafe | undefined {
  const { bebida, tamano, origen } = eleccion;

  if (bebida === undefined || tamano === undefined || origen === undefined) {
    return undefined;
  }

  return productos
    .filter(esCafe)
    .find(p => p.tipo === bebida && p.tamano === tamano && p.variedad.nombre === origen);
}

export function origenes(productos: Producto[]): Variedad[] {
  const porNombre = new Map<string, Variedad>();

  for (const cafe of productos.filter(esCafe)) {
    if (!porNombre.has(cafe.variedad.nombre)) {
      porNombre.set(cafe.variedad.nombre, cafe.variedad);
    }
  }

  const posicion = (nombre: string) => {
    const indice = ORDEN_ORIGENES.indexOf(nombre);
    return indice === -1 ? ORDEN_ORIGENES.length : indice;
  };

  return [...porNombre.values()].sort((a, b) => posicion(a.nombre) - posicion(b.nombre));
}

export function describirOrigen(variedad: Variedad): string {
  return `Acidez ${variedad.acidez}, cuerpo ${variedad.cuerpo}, notas ${variedad.notas}`;
}
