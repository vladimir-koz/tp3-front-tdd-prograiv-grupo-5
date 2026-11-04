import { Encabezado } from './componentes/Encabezado';
import { Menu } from './componentes/Menu';
import { leerMesa } from './dominio/mesa';
import { useMenu } from './menu/useMenu';

export function App() {
  const mesa = leerMesa(window.location.search);
  const { estado, reintentar } = useMenu();

  return (
    <>
      <Encabezado mesa={mesa} />
      <main className="container py-4">
        <h1>Cafetería Origen</h1>
        <Menu estado={estado} onReintentar={reintentar} />
      </main>
    </>
  );
}
