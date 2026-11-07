import type { Bebida, Cafe, Pasteleria, Producto, Tamano, Variedad } from '../api/schemas';

export interface Eleccion {
  bebida?: Bebida;
  tamano?: Tamano;
  origen?: string;
}

export function esCafe(_producto: Producto): _producto is Cafe {
  return false;
}

export function esPasteleria(_producto: Producto): _producto is Pasteleria {
  return false;
}

export function buscarCafe(_productos: Producto[], _eleccion: Eleccion): Cafe | undefined {
  return undefined;
}

export function origenes(_productos: Producto[]): Variedad[] {
  return [];
}

export function describirOrigen(_variedad: Variedad): string {
  return '';
}
