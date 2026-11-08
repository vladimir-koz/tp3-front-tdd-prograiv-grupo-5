import { useId } from 'react';
import { useCarrito } from '../carrito/CarritoContext';

export function Carrito({ onConfirmar }: { onConfirmar: () => void }) {
  const id = useId();
  const { items } = useCarrito();
  const vacio = items.length === 0;

  return (
    <section aria-labelledby={`${id}-titulo`} className="card shadow-sm">
      <div className="card-body">
        <h2 id={`${id}-titulo`} className="h5 card-title">
          Tu pedido
        </h2>
        {vacio && <p className="text-body-secondary">Tu carrito está vacío</p>}
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
