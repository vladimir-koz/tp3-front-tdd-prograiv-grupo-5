import { Producto } from './Producto';
import { Variedad } from './Variedad';

export type Tamano = 'Pocillo' | 'Mediano' | 'Taza grande';

export abstract class Cafe extends Producto {
  protected abstract readonly gramosPorTamano: Record<Tamano, number>;

  constructor(
    id: number,
    nombre: string,
    precioBase: number,
    readonly tamano: Tamano,
    readonly variedad: Variedad
  ) {
    super(id, nombre, precioBase);
  }

  get gramos(): number {
    return this.gramosPorTamano[this.tamano];
  }

  calcularPrecio(): number {
    return this.precioBase + this.gramos * this.variedad.precioPorGramo;
  }

  toJSON(): Record<string, unknown> {
    const { precio, ...datos } = super.toJSON();
    return { ...datos, tamano: this.tamano, gramos: this.gramos, variedad: this.variedad, precio };
  }
}
