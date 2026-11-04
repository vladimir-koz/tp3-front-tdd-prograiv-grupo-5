import type { EstadoMenu } from '../menu/useMenu';

export function Menu({ estado, onReintentar }: { estado: EstadoMenu; onReintentar: () => void }) {
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
      <ul>
        {estado.productos.map(producto => (
          <li key={producto.id}>{producto.nombre}</li>
        ))}
      </ul>
    );
  }

  return null;
}
