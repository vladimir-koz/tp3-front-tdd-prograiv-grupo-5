export function Encabezado({ mesa }: { mesa: number | null }) {
  return (
    <header className="encabezado bg-primary text-white">
      <div className="container d-flex justify-content-between align-items-center py-3">
        <h1 className="h4 mb-0">Cafetería Origen</h1>
        <p className="mb-0 badge bg-light text-primary fs-6">
          {mesa === null ? 'Retiro en barra' : `Mesa ${mesa}`}
        </p>
      </div>
    </header>
  );
}
