import { useCarrito } from './carrito/CarritoContext';
import { Carrito } from './componentes/Carrito';
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
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <Menu estado={estado} onReintentar={reintentar} onAgregar={agregar} />
          </div>
          <div className="col-12 col-lg-5">
            {/* Provisional: conectar el envío del pedido en el siguiente ciclo TDD. */}
            <Carrito onConfirmar={() => {}} />
          </div>
        </div>
      </main>
    </>
  );
}
