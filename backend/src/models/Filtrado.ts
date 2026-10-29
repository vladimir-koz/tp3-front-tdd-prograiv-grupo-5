import { Cafe } from './Cafe';

export class Filtrado extends Cafe {
  readonly tipo = 'filtrado';
  protected readonly gramosPorTamano = { Pocillo: 6, Mediano: 15, 'Taza grande': 25 };
}
