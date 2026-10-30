import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { App } from './App';

it('renderiza la aplicación React', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Cafetería Origen' })).toBeInTheDocument();
});
