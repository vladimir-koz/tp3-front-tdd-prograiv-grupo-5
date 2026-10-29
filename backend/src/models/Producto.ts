export type TipoProducto = 'expreso' | 'filtrado' | 'pasteleria';

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
