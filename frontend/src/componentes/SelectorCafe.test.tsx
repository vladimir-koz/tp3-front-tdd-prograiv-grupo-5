import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { productos } from '../test/fixtures';
import { elegirCafe } from '../test/utilidades';
import { SelectorCafe } from './SelectorCafe';

function renderizar() {
  const onAgregar = vi.fn();
  render(<SelectorCafe productos={productos} onAgregar={onAgregar} />);
  return { user: userEvent.setup(), onAgregar };
}

const origen = (nombre: string) => screen.getByRole('radio', { name: new RegExp(`^${nombre}`) });

describe('SelectorCafe', () => {
  it('muestra la sección con el título Café', () => {
    renderizar();
    expect(screen.getByRole('region', { name: 'Café' })).toBeInTheDocument();
  });

  it('ofrece bebida, tamaño y origen como grupos con etiqueta', () => {
    renderizar();
    expect(screen.getByRole('group', { name: /bebida/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /tamaño/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /origen/i })).toBeInTheDocument();
  });

  it('muestra los orígenes en el orden Colombia, Etiopía, Brasil', () => {
    renderizar();
    const radios = within(screen.getByRole('group', { name: /origen/i })).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAccessibleName('Colombia');
    expect(radios[1]).toHaveAccessibleName('Etiopía');
    expect(radios[2]).toHaveAccessibleName('Brasil');
  });

  it('cada origen muestra su descripción', () => {
    renderizar();
    expect(origen('Colombia')).toHaveAccessibleDescription(
      'Acidez media, cuerpo equilibrado, notas cítricas y florales'
    );
    expect(screen.getByText('Acidez baja, cuerpo denso, notas avellana')).toBeInTheDocument();
    expect(screen.getByText('Acidez muy viva, cuerpo ligero, notas frutales')).toBeInTheDocument();
  });

  it('el botón para agregar arranca deshabilitado', () => {
    renderizar();
    expect(screen.getByRole('button', { name: 'Agregar café' })).toBeDisabled();
  });

  it('sin bebida y tamaño los orígenes no muestran precio', async () => {
    const { user } = renderizar();
    await user.click(screen.getByRole('radio', { name: 'Expreso' }));
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it('con bebida y tamaño cada origen muestra su precio', async () => {
    const { user } = renderizar();
    await user.click(screen.getByRole('radio', { name: 'Expreso' }));
    await user.click(screen.getByRole('radio', { name: 'Mediano' }));

    expect(origen('Colombia')).toHaveAccessibleDescription(/\$7\.360/);
    expect(origen('Etiopía')).toHaveAccessibleDescription(/\$8\.980/);
    expect(origen('Brasil')).toHaveAccessibleDescription(/\$6\.280/);
  });

  it('al cambiar la bebida cambian los precios', async () => {
    const { user } = renderizar();
    await user.click(screen.getByRole('radio', { name: 'Expreso' }));
    await user.click(screen.getByRole('radio', { name: 'Mediano' }));
    await user.click(screen.getByRole('radio', { name: 'Filtrado' }));

    expect(origen('Colombia')).toHaveAccessibleDescription(/\$5\.900/);
  });

  it('sigue deshabilitado con bebida y tamaño pero sin origen', async () => {
    const { user } = renderizar();
    await user.click(screen.getByRole('radio', { name: 'Expreso' }));
    await user.click(screen.getByRole('radio', { name: 'Mediano' }));
    expect(screen.getByRole('button', { name: 'Agregar café' })).toBeDisabled();
  });

  it('con las tres elecciones agrega el café que corresponde', async () => {
    const { user, onAgregar } = renderizar();
    await elegirCafe(user, 'Expreso', 'Mediano', 'Colombia');

    const boton = screen.getByRole('button', { name: 'Agregar café' });
    expect(boton).toBeEnabled();
    await user.click(boton);

    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: 5, precio: 7360 }));
  });
});
