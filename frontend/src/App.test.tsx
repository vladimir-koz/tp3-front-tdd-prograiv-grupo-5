import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, it } from 'vitest';
import { App } from './App';
import { server } from './test/server';

beforeEach(() => {
  server.use(http.get('*/productos', () => HttpResponse.json([])));
});

it('renderiza la aplicación React', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Cafetería Origen' })).toBeInTheDocument();
});

it('muestra la mesa indicada en la URL dentro del encabezado', () => {
  const urlOriginal = window.location.href;

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    render(<App />);

    const encabezado = screen.getByRole('banner');
    expect(within(encabezado).getByText('Mesa 4')).toBeInTheDocument();
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});
