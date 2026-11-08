import { useId, useState } from 'react';
import { obtenerPedido } from '../api/cliente';
import type { Pedido } from '../api/schemas';
import { formatearPrecio } from '../dominio/precio';

const ETIQUETAS_ESTADO: Record<Pedido['estado'], string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  entregado: 'Entregado'
};

export function Confirmacion({ pedido: inicial }: { pedido: Pedido }) {
  const id = useId();
  const [pedido, setPedido] = useState(inicial);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  async function actualizar() {
    setMensajeError(null);
    try {
      setPedido(await obtenerPedido(pedido.id));
    } catch (error: unknown) {
      setMensajeError(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    }
  }

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
        {mensajeError !== null && (
          <div role="alert" className="alert alert-danger mt-3">
            {mensajeError}
          </div>
        )}
        <button type="button" className="btn btn-primary mt-3" onClick={actualizar}>
          Actualizar estado
        </button>
      </div>
    </section>
  );
}
