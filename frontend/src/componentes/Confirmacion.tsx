import { useId } from 'react';
import type { Pedido } from '../api/schemas';
import { formatearPrecio } from '../dominio/precio';

const ETIQUETAS_ESTADO: Record<Pedido['estado'], string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  entregado: 'Entregado'
};

export function Confirmacion({ pedido }: { pedido: Pedido }) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-titulo`} className="card shadow-sm">
      <div className="card-body">
        <h2 id={`${id}-titulo`} className="h4 card-title">
          Pedido #{pedido.id}
        </h2>
        <dl className="mb-0">
          <dt>Estado</dt>
          <dd>{ETIQUETAS_ESTADO[pedido.estado]}</dd>
          <dt>Total</dt>
          <dd className="fw-semibold">{formatearPrecio(pedido.total)}</dd>
        </dl>
      </div>
    </section>
  );
}
