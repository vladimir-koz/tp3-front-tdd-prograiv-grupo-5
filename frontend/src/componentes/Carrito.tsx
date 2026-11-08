import { useId } from 'react';
import { useCarrito } from '../carrito/CarritoContext';
import { subtotalCarrito, subtotalItem } from '../carrito/carritoReducer';
import { formatearPrecio } from '../dominio/precio';

export function Carrito({ onConfirmar }: { onConfirmar: () => void }) {
  const id = useId();
  const { items, sumar, restar, quitar } = useCarrito();
  const vacio = items.length === 0;

  return (
    <section aria-labelledby={`${id}-titulo`} className="card shadow-sm">
      <div className="card-body">
        <h2 id={`${id}-titulo`} className="h5 card-title">
          Tu pedido
        </h2>
        {vacio ? (
          <p className="text-body-secondary">Tu carrito está vacío</p>
        ) : (
          <ul className="list-group list-group-flush mb-3">
            {items.map(item => (
              <li key={item.producto.id} aria-label={item.producto.nombre} className="list-group-item px-0">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <span>{item.producto.nombre}</span>
                  <span className="fw-semibold text-nowrap">{formatearPrecio(subtotalItem(item))}</span>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    aria-label={`Restar ${item.producto.nombre}`}
                    onClick={() => restar(item.producto.id)}
                  >
                    −
                  </button>
                  Cantidad: <span>{item.cantidad}</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    aria-label={`Sumar ${item.producto.nombre}`}
                    onClick={() => sumar(item.producto.id)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-danger ms-auto"
                    aria-label={`Quitar ${item.producto.nombre}`}
                    onClick={() => quitar(item.producto.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="d-flex flex-wrap justify-content-between gap-2">
          <span>Subtotal orientativo</span>
          <strong>{formatearPrecio(subtotalCarrito(items))}</strong>
        </p>
        <button
          type="button"
          className="btn btn-primary w-100"
          disabled={vacio}
          onClick={onConfirmar}
        >
          Confirmar pedido
        </button>
      </div>
    </section>
  );
}
