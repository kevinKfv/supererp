/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './pages/Login';

// Mock axios para que no haga peticiones reales
vi.mock('axios', () => ({ default: { post: vi.fn(), isAxiosError: vi.fn() } }));

describe('Login Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renderiza el formulario de inicio de sesión', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByLabelText('Usuario')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeTruthy();
  });

  it('muestra las credenciales de prueba', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/admin_supererp/)).toBeTruthy();
    expect(screen.getByText(/SuperSecretPassword123/)).toBeTruthy();
  });

  it('muestra error si se envía con campos vacíos', async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const btn = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(btn);
    expect(await screen.findByText('Completá usuario y contraseña.')).toBeTruthy();
  });

  it('botón de mostrar/ocultar contraseña cambia tipo del input', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passInput = screen.getByLabelText('Contraseña');
    const toggleBtn = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(passInput.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(passInput.type).toBe('text');
  });
});
