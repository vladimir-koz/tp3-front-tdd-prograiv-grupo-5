import { z } from 'zod';

const ProductoBaseSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  precio: z.number().nonnegative()
});

const CafeBaseSchema = ProductoBaseSchema.extend({
  tamano: z.enum(['Pocillo', 'Mediano', 'Taza grande']),
  gramos: z.number(),
  variedad: z.object({
    id: z.number().int(),
    nombre: z.string(),
    acidez: z.string(),
    cuerpo: z.string(),
    notas: z.string()
  })
});

export const ProductoSchema = z.discriminatedUnion('tipo', [
  CafeBaseSchema.extend({ tipo: z.literal('expreso') }),
  CafeBaseSchema.extend({ tipo: z.literal('filtrado') }),
  ProductoBaseSchema.extend({ tipo: z.literal('pasteleria') })
]);

export const ProductosSchema = z.array(ProductoSchema);

export const PedidoSchema = z.object({
  id: z.number().int().positive(),
  mesa: z.number().int().positive().nullable(),
  estado: z.enum(['pendiente', 'en_preparacion', 'entregado']),
  items: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive()
  })).min(1),
  total: z.number().nonnegative()
});

export type Producto = z.infer<typeof ProductoSchema>;
export type Cafe = Extract<Producto, { tipo: 'expreso' | 'filtrado' }>;
export type Pasteleria = Extract<Producto, { tipo: 'pasteleria' }>;
export type Bebida = Cafe['tipo'];
export type Tamano = Cafe['tamano'];
export type Variedad = Cafe['variedad'];
export type Pedido = z.infer<typeof PedidoSchema>;
