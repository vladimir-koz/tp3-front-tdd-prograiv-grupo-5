import { Variedad } from './Variedad';

export type TipoProducto = 'expreso' | 'filtrado' | 'pasteleria';
export type Tamano = 'Pocillo' | 'Mediano' | 'Taza grande';

export abstract class Producto {
  abstract readonly tipo: TipoProducto;

  constructor(
    readonly id: number,
    readonly nombre: string,
    readonly precioBase: number
  ) {}

  abstract calcularPrecio(): number;

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tipo: this.tipo,
      nombre: this.nombre,
      precioBase: this.precioBase,
      precio: this.calcularPrecio()
    };
  }
}

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

export class Expreso extends Cafe {
  readonly tipo = 'expreso';
  protected readonly gramosPorTamano = { Pocillo: 18, Mediano: 27, 'Taza grande': 36 };
}

export class Filtrado extends Cafe {
  readonly tipo = 'filtrado';
  protected readonly gramosPorTamano = { Pocillo: 6, Mediano: 15, 'Taza grande': 25 };
}

export class Pasteleria extends Producto {
  readonly tipo = 'pasteleria';

  calcularPrecio(): number {
    return this.precioBase;
  }
}
