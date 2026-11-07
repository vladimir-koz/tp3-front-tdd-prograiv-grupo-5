import type { Cafe, Producto } from '../api/schemas';

interface Props {
  productos: Producto[];
  onAgregar: (cafe: Cafe) => void;
}

export function SelectorCafe(_props: Props) {
  return null;
}
