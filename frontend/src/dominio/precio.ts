export function formatearPrecio(monto: number): string {
  return `$${monto.toLocaleString('es-AR')}`;
}
