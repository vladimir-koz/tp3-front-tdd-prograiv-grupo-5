import { Producto } from './Producto';

export class Pasteleria extends Producto {
  readonly tipo = 'pasteleria';

  calcularPrecio(): number {
    return this.precioBase;
  }
}
