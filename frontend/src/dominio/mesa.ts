export function leerMesa(search: string): number | null {
  return Number(new URLSearchParams(search).get('mesa'));
}
