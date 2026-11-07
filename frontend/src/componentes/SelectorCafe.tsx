import { useId, useState } from 'react';
import type { Bebida, Cafe, Producto, Tamano } from '../api/schemas';
import { BEBIDAS, TAMANOS, buscarCafe, describirOrigen, origenes } from '../dominio/cafe';
import { formatearPrecio } from '../dominio/precio';

interface Props {
  productos: Producto[];
  onAgregar: (cafe: Cafe) => void;
}

export function SelectorCafe({ productos, onAgregar }: Props) {
  const id = useId();
  const [bebida, setBebida] = useState<Bebida>();
  const [tamano, setTamano] = useState<Tamano>();
  const [origen, setOrigen] = useState<string>();

  const elegido = buscarCafe(productos, { bebida, tamano, origen });

  return (
    <section aria-labelledby={`${id}-titulo`} className="card shadow-sm">
      <div className="card-body">
        <h2 id={`${id}-titulo`} className="h5 card-title">
          Café
        </h2>

        <fieldset className="mb-3">
          <legend className="fs-6 fw-semibold">1. Bebida</legend>
          <div className="btn-group w-100" role="group">
            {BEBIDAS.map(b => (
              <span key={b.valor} className="flex-fill d-flex">
                <input
                  type="radio"
                  className="btn-check"
                  name={`${id}-bebida`}
                  id={`${id}-bebida-${b.valor}`}
                  checked={bebida === b.valor}
                  onChange={() => setBebida(b.valor)}
                />
                <label className="btn btn-outline-primary w-100" htmlFor={`${id}-bebida-${b.valor}`}>
                  {b.etiqueta}
                </label>
              </span>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-3">
          <legend className="fs-6 fw-semibold">2. Tamaño</legend>
          <div className="btn-group w-100" role="group">
            {TAMANOS.map((t, i) => (
              <span key={t} className="flex-fill d-flex">
                <input
                  type="radio"
                  className="btn-check"
                  name={`${id}-tamano`}
                  id={`${id}-tamano-${i}`}
                  checked={tamano === t}
                  onChange={() => setTamano(t)}
                />
                <label className="btn btn-outline-primary w-100" htmlFor={`${id}-tamano-${i}`}>
                  {t}
                </label>
              </span>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-3">
          <legend className="fs-6 fw-semibold">3. Origen</legend>
          <div className="d-grid gap-2">
            {origenes(productos).map((variedad, i) => {
              const radioId = `${id}-origen-${i}`;
              const precio = buscarCafe(productos, { bebida, tamano, origen: variedad.nombre })?.precio;

              return (
                <div key={variedad.nombre} className="form-check origen position-relative border rounded p-2 ps-5">
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`${id}-origen`}
                    id={radioId}
                    checked={origen === variedad.nombre}
                    onChange={() => setOrigen(variedad.nombre)}
                    aria-describedby={
                      precio === undefined ? `${radioId}-desc` : `${radioId}-desc ${radioId}-precio`
                    }
                  />
                  <div className="d-flex justify-content-between">
                    <label className="form-check-label fw-semibold stretched-link" htmlFor={radioId}>
                      {variedad.nombre}
                    </label>
                    <span id={`${radioId}-precio`} className="fw-semibold text-primary">
                      {precio === undefined ? '' : formatearPrecio(precio)}
                    </span>
                  </div>
                  <p id={`${radioId}-desc`} className="small text-body-secondary mb-0">
                    {describirOrigen(variedad)}
                  </p>
                </div>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          className="btn btn-primary w-100"
          disabled={elegido === undefined}
          onClick={() => elegido && onAgregar(elegido)}
        >
          Agregar café
        </button>
      </div>
    </section>
  );
}
