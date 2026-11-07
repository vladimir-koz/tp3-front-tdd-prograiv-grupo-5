import type { Producto } from '../api/schemas';
import type { EstadoMenu } from '../menu/useMenu';
import { Pasteleria } from './Pasteleria';
import { SelectorCafe } from './SelectorCafe';

interface Props {
  estado: EstadoMenu;
  onReintentar: () => void;
  onAgregar: (producto: Producto) => void;
}

export function Menu({ estado, onReintentar, onAgregar }: Props) {
  if (estado.estado === 'cargando') {
    return <div role="status">Cargando menú</div>;
  }

  if (estado.estado === 'error') {
    return (
      <div role="alert">
        <p>{estado.mensaje}</p>
        <button type="button" onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    );
  }

  if (estado.estado === 'listo') {
    return (
      <div className="d-grid gap-3">
        <SelectorCafe productos={estado.productos} onAgregar={onAgregar} />
        <Pasteleria productos={estado.productos} onAgregar={onAgregar} />
      </div>
    );
  }

  return null;
}
