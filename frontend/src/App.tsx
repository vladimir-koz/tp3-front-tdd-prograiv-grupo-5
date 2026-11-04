import { Encabezado } from './componentes/Encabezado';
import { leerMesa } from './dominio/mesa';

export function App() {
  const mesa = leerMesa(window.location.search);

  return (
    <>
      <Encabezado mesa={mesa} />
      <main className="container py-4">
        <h1>Cafetería Origen</h1>
      </main>
    </>
  );
}
