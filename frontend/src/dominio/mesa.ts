export function leerMesa(search: string): number | null {
  const mesa = Number(new URLSearchParams(search).get('mesa'));
  return Number.isSafeInteger(mesa) && mesa > 0 ? mesa : null;
}
