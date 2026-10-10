/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import { OptimizationDemo } from './OptimizationDemo';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const saveTask = () => localStorage.setItem('optimus-optimization-task', JSON.stringify({ id: 'saved-id', savedAt: Date.now() }));

describe('Optimización', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('valida una celda vacía sin enviar una tarea', () => {
    render(<OptimizationDemo />);
    fireEvent.change(screen.getByLabelText('Costo de Empleado 1 para Tarea 1'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar optimización' }));
    expect(screen.getByText('Ingresá un número válido.')).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('recupera el ID, pausa después de 30 segundos y consulta sin crear otra tarea', async () => {
    vi.useFakeTimers();
    saveTask();
    axios.get.mockResolvedValue({ data: { status: 'PENDING' } });
    render(<OptimizationDemo />);

    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(screen.getByText('saved-id')).toBeTruthy();
    expect(screen.getByText(/La ejecución puede seguir en proceso/)).toBeTruthy();
    const callsAtTimeout = axios.get.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(axios.get).toHaveBeenCalledTimes(callsAtTimeout);

    fireEvent.click(screen.getByRole('button', { name: 'Consultar de nuevo' }));
    await act(async () => { await Promise.resolve(); });
    expect(axios.get.mock.calls.length).toBeGreaterThan(callsAtTimeout);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: 'SUCCESS', result: { status: 'INFEASIBLE' } }, /No factible: el motor/],
    [{ status: 'FAILURE', error: 'falló' }, /La optimización falló/],
  ])('distingue el resultado no factible de un fallo de ejecución', async (response, message) => {
    saveTask();
    axios.get.mockResolvedValue({ data: response });
    render(<OptimizationDemo />);
    expect(await screen.findByText(message)).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Consultar de nuevo' })).toBeNull();
  });

  it('muestra un problema de conexión y permite consultar el mismo ID', async () => {
    saveTask();
    axios.get.mockRejectedValue(new Error('Network error'));
    render(<OptimizationDemo />);
    expect(await screen.findByText(/No se pudo consultar la ejecución/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Consultar de nuevo' })).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('descarta un ID guardado hace más de 24 horas', () => {
    localStorage.setItem('optimus-optimization-task', JSON.stringify({ id: 'old-id', savedAt: Date.now() - 24 * 60 * 60 * 1000 }));
    render(<OptimizationDemo />);
    expect(screen.getByRole('heading', { name: 'Matriz de costos' })).toBeTruthy();
    expect(localStorage.getItem('optimus-optimization-task')).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('conserva el resultado y el borrador al editar, incluso si falla un nuevo envío', async () => {
    saveTask();
    axios.get.mockResolvedValue({ data: {
      status: 'SUCCESS',
      context: { workerNames: ['Marcos', 'Ana'], taskNames: ['Inventario', 'Ventas'], costs: [[4, 1], [2, 3]], allowed: [[true, true], [true, true]], unit: 'pesos', currentAssignment: [0, 1] },
      result: { status: 'OPTIMAL', total_cost: 3, assignments: [{ worker: 0, task: 1, cost: 1 }, { worker: 1, task: 0, cost: 2 }] },
    } });
    axios.post.mockRejectedValue(new Error('Sin conexión'));
    render(<OptimizationDemo />);

    expect(await screen.findByText('Total propuesto: 3 pesos')).toBeTruthy();
    const rows = screen.getByRole('heading', { name: 'Comparación por tarea' }).parentElement.querySelectorAll('li');
    expect(rows[0].textContent).toContain('Inventario');
    expect(rows[1].textContent).toContain('Ventas');

    fireEvent.click(screen.getByRole('button', { name: 'Editar matriz' }));
    const cost = screen.getByLabelText('Costo de Marcos para Inventario');
    expect(cost.value).toBe('4');
    fireEvent.change(cost, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Volver al resultado anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar matriz' }));
    expect(screen.getByLabelText('Costo de Marcos para Inventario').value).toBe('8');

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar optimización' }));
    expect(await screen.findByText('No se pudo iniciar la optimización. Intentá nuevamente.')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('optimus-optimization-task')).id).toBe('saved-id');
    fireEvent.click(screen.getByRole('button', { name: 'Volver al resultado anterior' }));
    expect(screen.getByText('Total propuesto: 3 pesos')).toBeTruthy();
  });

  it('reemplaza el ID solo después de aceptar una nueva ejecución', async () => {
    saveTask();
    axios.get.mockImplementation((url) => Promise.resolve({ data: url.endsWith('saved-id')
      ? { status: 'SUCCESS', context: { workerNames: ['Marcos', 'Ana'], taskNames: ['Tarea 1', 'Tarea 2'], costs: [[4, 1], [2, 3]], allowed: [[true, true], [true, true]], unit: 'pesos', currentAssignment: null }, result: { status: 'OPTIMAL', total_cost: 3, assignments: [{ worker: 0, task: 1, cost: 1 }, { worker: 1, task: 0, cost: 2 }] } }
      : { status: 'PENDING' } }));
    axios.post.mockResolvedValue({ data: { task_id: 'next-id' } });
    render(<OptimizationDemo />);
    await screen.findByRole('button', { name: 'Editar matriz' });
    fireEvent.click(screen.getByRole('button', { name: 'Editar matriz' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar optimización' }));
    expect(await screen.findByText('next-id')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('optimus-optimization-task'))).toMatchObject({ id: 'next-id' });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('aplica permisos por tarea y muestra el costo actual solo si la comparación está completa', () => {
    render(<OptimizationDemo />);
    fireEvent.change(screen.getByLabelText('Empleado actual para Tarea 1'), { target: { value: '0' } });
    expect(screen.getByText('Asignadas 1 de 2 tareas. Faltan 1.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Empleado actual para Tarea 2'), { target: { value: '1' } });
    expect(screen.getByText('Asignadas 2 de 2 tareas. Costo actual: 7 unidades.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Costo de Empleado 1 para Tarea 1'), { target: { value: '' } });
    expect(screen.getByText('Revisá los costos y permisos de la asignación actual para calcular el total.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Costo de Empleado 1 para Tarea 1'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Unidad de los costos'), { target: { value: '' } });
    expect(screen.getByText('Escribí la unidad de los costos para ver el total actual.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Unidad de los costos'), { target: { value: 'unidades' } });

    fireEvent.click(screen.getByRole('button', { name: 'Bloquear a todos los empleados en Tarea 1' }));
    expect(screen.getByText('Asignadas 1 de 2 tareas. Faltan 1.')).toBeTruthy();
    expect(screen.getByLabelText('Costo de Empleado 1 para Tarea 1').disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Permitir a todos los empleados en Tarea 1' }));
    expect(screen.getByLabelText('Costo de Empleado 1 para Tarea 1').value).toBe('4');

    fireEvent.change(screen.getByLabelText('Nombre del empleado 1'), { target: { value: 'Marcos' } });
    fireEvent.change(screen.getByLabelText('Nombre de la tarea 1'), { target: { value: 'Inventario' } });
    expect(screen.getAllByLabelText('Costo de Marcos para Inventario')).toHaveLength(1);
    expect(screen.getByLabelText('Marcos puede hacer Inventario')).toBeTruthy();
  });
});
