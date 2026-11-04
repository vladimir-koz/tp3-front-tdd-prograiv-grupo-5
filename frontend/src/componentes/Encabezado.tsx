export function Encabezado({ mesa }: { mesa: number | null }) {
  return <header>{mesa === null ? 'Retiro en barra' : `Mesa ${mesa}`}</header>;
}
