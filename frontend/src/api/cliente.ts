import type { z } from 'zod';
import { PedidoSchema, ProductosSchema, type Pedido, type Producto } from './schemas';

const SIN_CONEXION = 'No se pudo conectar con el servidor';
const FORMATO_INESPERADO = 'La respuesta del servidor no tiene el formato esperado';

async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    return await respuesta.json();
  } catch {
    return undefined;
  }
}

// Única puerta de salida HTTP: valida la respuesta antes de devolverla.
async function solicitar<T>(ruta: string, esquema: z.ZodType<T>, opciones?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(ruta, window.location.origin), opciones);
  } catch {
    throw new Error(SIN_CONEXION);
  }

  const datos = await leerJson(respuesta);

  if (!respuesta.ok) {
    if (typeof datos === 'object' && datos !== null && 'error' in datos && typeof datos.error === 'string') {
      throw new Error(datos.error);
    }
    // Sin el formato { error } de la API: el proxy (Vite o Nginx) no pudo llegar al backend.
    throw new Error(SIN_CONEXION);
  }

  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new Error(FORMATO_INESPERADO);
  }
  return resultado.data;
}

export function obtenerProductos(): Promise<Producto[]> {
  return solicitar('/productos', ProductosSchema);
}

export function crearPedido(nuevoPedido: Pick<Pedido, 'mesa' | 'items'>): Promise<Pedido> {
  return solicitar('/pedidos', PedidoSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoPedido)
  });
}

export function obtenerPedido(id: number): Promise<Pedido> {
  return solicitar(`/pedidos/${id}`, PedidoSchema);
}
