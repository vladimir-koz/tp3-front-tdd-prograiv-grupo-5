import { Cafe } from './Cafe';

export class Expreso extends Cafe {
  readonly tipo = 'expreso';
  protected readonly gramosPorTamano = { Pocillo: 18, Mediano: 27, 'Taza grande': 36 };
}
