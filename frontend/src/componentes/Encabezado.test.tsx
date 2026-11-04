import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Encabezado } from './Encabezado';

it('muestra Mesa 4 dentro del encabezado cuando recibe mesa={4}', () => {
  render(<Encabezado mesa={4} />);

  const encabezado = screen.getByRole('banner');
  expect(within(encabezado).getByText('Mesa 4')).toBeInTheDocument();
});

it('muestra Retiro en barra dentro del encabezado cuando recibe mesa={null}', () => {
  render(<Encabezado mesa={null} />);

  const encabezado = screen.getByRole('banner');
  expect(within(encabezado).getByText('Retiro en barra')).toBeInTheDocument();
});
