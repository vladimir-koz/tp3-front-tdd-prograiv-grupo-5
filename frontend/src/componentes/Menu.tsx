import type { EstadoMenu } from '../menu/useMenu';

export function Menu({ estado }: { estado: EstadoMenu }) {
  if (estado.estado === 'cargando') {
    return <div role="status">Cargando menú</div>;
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
