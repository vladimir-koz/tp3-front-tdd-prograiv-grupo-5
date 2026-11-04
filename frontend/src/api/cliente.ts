import { ProductosSchema, type Producto } from './schemas';

export async function obtenerProductos(): Promise<Producto[]> {
  let respuesta: Response;

  try {
    respuesta = await fetch(new URL('/productos', window.location.origin));
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  const datos: unknown = await respuesta.json();

  if (!respuesta.ok) {
    const mensaje =
      typeof datos === 'object' && datos !== null && 'error' in datos && typeof datos.error === 'string'
        ? datos.error
        : `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }

  return ProductosSchema.parse(datos);
}
