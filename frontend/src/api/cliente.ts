import { ProductosSchema, type Producto } from './schemas';

export async function obtenerProductos(): Promise<Producto[]> {
  const respuesta = await fetch(new URL('/productos', window.location.origin));
  const datos: unknown = await respuesta.json();
  return ProductosSchema.parse(datos);
}
