import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export async function elegirCafe(user: UserEvent, bebida: string, tamano: string, origen: string) {
  await user.click(screen.getByRole('radio', { name: bebida }));
  await user.click(screen.getByRole('radio', { name: tamano }));
  await user.click(screen.getByRole('radio', { name: new RegExp(`^${origen}`) }));
}
