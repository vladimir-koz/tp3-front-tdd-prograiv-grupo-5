export function Encabezado({ mesa }: { mesa: number | null }) {
  return (
    <header>
      <h1>Cafetería Origen</h1>
      <p>{mesa === null ? 'Retiro en barra' : `Mesa ${mesa}`}</p>
    </header>
  );
}
