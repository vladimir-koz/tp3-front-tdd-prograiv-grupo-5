import { useState } from 'react';
import { crearPedido } from './api/cliente';
import type { Pedido } from './api/schemas';
import { useCarrito } from './carrito/CarritoContext';
import { Carrito } from './componentes/Carrito';
import { Confirmacion } from './componentes/Confirmacion';
import { Encabezado } from './componentes/Encabezado';
import { Menu } from './componentes/Menu';
import { leerMesa } from './dominio/mesa';
import { useMenu } from './menu/useMenu';

export function App() {
  const mesa = leerMesa(window.location.search);
  const { estado, reintentar } = useMenu();
  const { items, agregar, vaciar } = useCarrito();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  async function confirmar() {
    const creado = await crearPedido({
      mesa,
      items: items.map(item => ({ productoId: item.producto.id, cantidad: item.cantidad }))
    });
    vaciar();
    setPedido(creado);
  }

  return (
    <>
      <Encabezado mesa={mesa} />
      <main className="container py-4">
        {pedido !== null ? (
          <Confirmacion pedido={pedido} />
        ) : (
          <div className="row g-3">
            <div className="col-12 col-lg-7">
              <Menu estado={estado} onReintentar={reintentar} onAgregar={agregar} />
            </div>
            <div className="col-12 col-lg-5">
              <Carrito onConfirmar={confirmar} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
