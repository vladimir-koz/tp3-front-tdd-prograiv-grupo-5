import { useCarrito } from './carrito/CarritoContext';
import { Encabezado } from './componentes/Encabezado';
import { Menu } from './componentes/Menu';
import { leerMesa } from './dominio/mesa';
import { useMenu } from './menu/useMenu';

export function App() {
  const mesa = leerMesa(window.location.search);
  const { estado, reintentar } = useMenu();
  const { agregar } = useCarrito();

  return (
    <>
      <Encabezado mesa={mesa} />
      <main className="container py-4">
        <Menu estado={estado} onReintentar={reintentar} onAgregar={agregar} />
      </main>
    </>
  );
}
