import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { productos } from '../test/fixtures';
import { Pasteleria } from './Pasteleria';

describe('Pasteleria', () => {
  it('muestra la sección con el título Pastelería', () => {
    render(<Pasteleria productos={productos} onAgregar={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'Pastelería' })).toBeInTheDocument();
  });

  it('lista solo los productos de pastelería con su precio', () => {
    render(<Pasteleria productos={productos} onAgregar={vi.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Muffin de chocolate')).toBeInTheDocument();
    expect(within(items[0]).getByText('$2.500')).toBeInTheDocument();
    expect(within(items[1]).getByText('Porción de torta selva negra')).toBeInTheDocument();
    expect(within(items[1]).getByText('$4.200')).toBeInTheDocument();
  });

  it('cada producto tiene un botón para agregarlo', async () => {
    const onAgregar = vi.fn();
    const user = userEvent.setup();
    render(<Pasteleria productos={productos} onAgregar={onAgregar} />);

    await user.click(screen.getByRole('button', { name: 'Agregar Porción de torta selva negra' }));

    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: 20, precio: 4200 }));
  });
});
