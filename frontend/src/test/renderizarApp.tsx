import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { App } from '../App';
import { CarritoProvider } from '../carrito/CarritoContext';

// Renderiza la App como en main.tsx: dentro del CarritoProvider.
// `extra` se monta dentro del mismo provider (útil para observar el carrito).
export function renderizarApp(extra?: ReactNode) {
  return render(
    <CarritoProvider>
      <App />
      {extra}
    </CarritoProvider>
  );
}
