import type { Pasteleria as ProductoPasteleria, Producto } from '../api/schemas';

interface Props {
  productos: Producto[];
  onAgregar: (producto: ProductoPasteleria) => void;
}

export function Pasteleria(_props: Props) {
  return null;
}
