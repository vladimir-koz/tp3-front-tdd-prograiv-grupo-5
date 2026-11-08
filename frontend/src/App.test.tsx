import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, it } from 'vitest';
import { renderizarApp } from './test/renderizarApp';
import { server } from './test/server';

beforeEach(() => {
  server.use(http.get('*/productos', () => HttpResponse.json([])));
});

it('renderiza la aplicación React', () => {
  renderizarApp();
  expect(screen.getByRole('heading', { name: 'Cafetería Origen' })).toBeInTheDocument();
});

it('muestra la mesa indicada en la URL dentro del encabezado', () => {
  const urlOriginal = window.location.href;

  try {
    window.history.replaceState(null, '', '/?mesa=4');
    renderizarApp();

    const encabezado = screen.getByRole('banner');
    expect(within(encabezado).getByText('Mesa 4')).toBeInTheDocument();
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});

it('muestra Retiro en barra en el encabezado cuando la URL no tiene mesa', () => {
  const urlOriginal = window.location.href;

  try {
    window.history.replaceState(null, '', '/');
    renderizarApp();

    const encabezado = screen.getByRole('banner');
    expect(within(encabezado).getByText('Retiro en barra')).toBeInTheDocument();
  } finally {
    window.history.replaceState(null, '', urlOriginal);
  }
});
