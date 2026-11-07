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
    return (
      <div role="status" className="d-flex align-items-center gap-2 py-4">
        <span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
        Cargando menú…
      </div>
    );
  }

  if (estado.estado === 'error') {
    return (
      <div role="alert" className="alert alert-danger">
        <p>No se pudo cargar el menú: {estado.mensaje}</p>
        <button type="button" className="btn btn-outline-danger" onClick={onReintentar}>
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
