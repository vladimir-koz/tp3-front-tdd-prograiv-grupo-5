import { useId } from 'react';
import type { Pasteleria as ProductoPasteleria, Producto } from '../api/schemas';
import { esPasteleria } from '../dominio/cafe';
import { formatearPrecio } from '../dominio/precio';

interface Props {
  productos: Producto[];
  onAgregar: (producto: ProductoPasteleria) => void;
}

export function Pasteleria({ productos, onAgregar }: Props) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-titulo`} className="card shadow-sm">
      <div className="card-body">
        <h2 id={`${id}-titulo`} className="h5 card-title">
          Pastelería
        </h2>
        <ul className="list-group list-group-flush">
          {productos.filter(esPasteleria).map(producto => (
            <li
              key={producto.id}
              className="list-group-item d-flex justify-content-between align-items-center gap-2 px-0"
            >
              <span>
                {producto.nombre}
                <span className="d-block fw-semibold text-primary">{formatearPrecio(producto.precio)}</span>
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-shrink-0"
                aria-label={`Agregar ${producto.nombre}`}
                onClick={() => onAgregar(producto)}
              >
                Agregar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
