import { useEffect, useState } from 'react';
import type { ClipboardEvent, FormEvent } from 'react';
import axios from 'axios';
import { Loader2, Info, FileSpreadsheet, Sparkles, Layers, Users, Calculator } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

type Assignment = { worker: number; task: number; cost: number };
type SubmittedMatrix = {
  workerNames: string[];
  taskNames: string[];
  costs: number[][];
  allowed: boolean[][];
  unit: string;
  currentAssignment: number[] | null;
};
type AssignmentResult = {
  status: 'OPTIMAL' | 'FEASIBLE';
  total_cost: number;
  assignments: Assignment[];
};
type SavedTask = { id: string; savedAt: number };
type CsvPreview = {
  fileName: string;
  unit: string | null;
  workerNames: string[];
  taskNames: string[];
  costs: string[][];
  allowed: boolean[][];
};

const taskKey = 'optimus-optimization-task';
const taskLifetime = 24 * 60 * 60 * 1000;

const parseCsv = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const data = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    if (quoted) {
      if (char === '"' && data[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && !cell) quoted = true;
    else if (char === delimiter) { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (quoted) throw new Error('El CSV tiene comillas sin cerrar.');
  if (row.length || cell) { row.push(cell); rows.push(row); }
  return rows;
};

const csvCell = (value: string): string => /[;"\r\n]/.test(value) ? '"' + value.replaceAll('"', '""') + '"' : value;
const normalizeCost = (value: string): string | null => {
  const cost = value.trim().replace(',', '.');
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(cost) && Number.isFinite(Number(cost)) ? cost : null;
};

const saveCsv = (rows: string[][], fileName: string) => {
  const csv = rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const findAssignmentConflict = (allowed: boolean[][]): { tasks: number[]; workers: number[] } | null => {
  const assignedTaskByWorker = Array(allowed.length).fill(-1);
  const assign = (task: number, visited: boolean[]): boolean => {
    for (let worker = 0; worker < allowed.length; worker++) {
      if (!allowed[worker][task] || visited[worker]) continue;
      visited[worker] = true;
      if (assignedTaskByWorker[worker] === -1 || assign(assignedTaskByWorker[worker], visited)) {
        assignedTaskByWorker[worker] = task;
        return true;
      }
    }
    return false;
  };
  for (let task = 0; task < (allowed[0]?.length ?? 0); task++) {
    const visited = Array(allowed.length).fill(false);
    if (!assign(task, visited)) {
      const workers = visited.flatMap((seen, worker) => seen ? [worker] : []);
      const tasks = [task, ...workers.map((worker) => assignedTaskByWorker[worker]).filter((assigned) => assigned !== -1)].sort((a, b) => a - b);
      return { tasks, workers };
    }
  }
  return null;
};

const explainAssignmentConflict = (allowed: boolean[][], workerNames: string[], taskNames: string[]): string | null => {
  const taskWithoutWorker = taskNames.findIndex((_, task) => allowed.every((row) => !row[task]));
  if (taskWithoutWorker >= 0) return `${taskNames[taskWithoutWorker] || 'Tarea ' + (taskWithoutWorker + 1)} no tiene empleados permitidos.`;
  const conflict = allowed.length >= taskNames.length ? findAssignmentConflict(allowed) : null;
  if (!conflict) return null;
  return `Las tareas ${conflict.tasks.map((task) => taskNames[task] || 'Tarea ' + (task + 1)).join(', ')} comparten solo ${conflict.workers.length} ${conflict.workers.length === 1 ? 'empleado compatible' : 'empleados compatibles'} (${conflict.workers.map((worker) => workerNames[worker] || 'Empleado ' + (worker + 1)).join(', ')}). Cada tarea necesita una persona distinta.`;
};

const readSavedTask = (): SavedTask | null => {
  try {
    const value = localStorage.getItem(taskKey);
    if (!value) return null;
    const saved = JSON.parse(value) as Partial<SavedTask>;
    if (
      typeof saved.id === 'string' && saved.id &&
      typeof saved.savedAt === 'number' &&
      Date.now() >= saved.savedAt && Date.now() - saved.savedAt < taskLifetime
    ) return { id: saved.id, savedAt: saved.savedAt };
    localStorage.removeItem(taskKey);
  } catch {
    // La vista sigue disponible aunque el almacenamiento del navegador falle.
  }
  return null;
};

export const OptimizationDemo = () => {
  const [matrix, setMatrix] = useState<string[][]>([['4', '1'], ['2', '3']]);
  const [workerNames, setWorkerNames] = useState(['Empleado 1', 'Empleado 2']);
  const [taskNames, setTaskNames] = useState(['Tarea 1', 'Tarea 2']);
  const [allowed, setAllowed] = useState<boolean[][]>([[true, true], [true, true]]);
  const [currentAssignment, setCurrentAssignment] = useState<string[]>(['', '']);
  const [submittedMatrix, setSubmittedMatrix] = useState<SubmittedMatrix | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [comparisonError, setComparisonError] = useState(false);
  const [task, setTask] = useState<SavedTask | null>(readSavedTask);
  const [showForm, setShowForm] = useState(task === null);
  const [draftTaskId, setDraftTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(task !== null);
  const [status, setStatus] = useState(task ? 'PENDING' : '');
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [infeasible, setInfeasible] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invalidCell, setInvalidCell] = useState<{ row: number; column: number } | null>(null);
  const [pasteFeedback, setPasteFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [unitName, setUnitName] = useState('unidades');
  const [unitNameError, setUnitNameError] = useState(false);
  const [sameUnitConfirmed, setSameUnitConfirmed] = useState(false);
  const [unitError, setUnitError] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const feasibilityMessage = explainAssignmentConflict(allowed, workerNames, taskNames);
  const infeasibilityDetail = submittedMatrix?.allowed && explainAssignmentConflict(submittedMatrix.allowed, submittedMatrix.workerNames, submittedMatrix.taskNames);
  const selectedCount = currentAssignment.filter(Boolean).length;
  const comparisonComplete = selectedCount === taskNames.length &&
    new Set(currentAssignment).size === currentAssignment.length &&
    currentAssignment.every((worker, task) => allowed[Number(worker)]?.[task] && normalizeCost(matrix[Number(worker)]?.[task] ?? '') !== null);
  const draftCurrentCost = comparisonComplete
    ? currentAssignment.reduce((total, worker, task) => total + Number(matrix[Number(worker)][task]), 0) : null;

  useEffect(() => {
    if (!task || showForm || !isPolling) return;

    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    const stopPolling = () => {
      active = false;
      setIsPolling(false);
    };

    const checkStatus = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      try {
        const response = await axios.get(API_ENDPOINTS.optimization.status(task.id), {
          signal: controller.signal,
        });
        if (!active) return;
        const data = response.data;
        if (data.context) setSubmittedMatrix((current) => current ?? data.context as SubmittedMatrix);

        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS');
          const solution = data.result as { status?: string; total_cost?: number; assignments?: Assignment[] } | undefined;
          if (solution?.status === 'INFEASIBLE') {
            setInfeasible(true);
          } else if (
            (solution?.status === 'OPTIMAL' || solution?.status === 'FEASIBLE') &&
            typeof solution.total_cost === 'number' && Number.isFinite(solution.total_cost) &&
            Array.isArray(solution.assignments) && solution.assignments.length > 0 &&
            solution.assignments.every((item: Assignment) =>
              Number.isInteger(item.worker) && Number.isInteger(item.task) && Number.isFinite(item.cost)
            )
          ) {
            setResult(solution as AssignmentResult);
          } else {
            setOperationError('La ejecución devolvió un resultado inválido. Intentá iniciar una nueva optimización.');
          }
          stopPolling();
        } else if (data.status === 'FAILURE') {
          setStatus('FAILURE');
          setOperationError('La optimización falló. Revisá la matriz e iniciá una nueva ejecución.');
          stopPolling();
        } else if (['PENDING', 'STARTED', 'RETRY'].includes(data.status)) {
          setStatus(data.status);
        } else {
          setOperationError('No se pudo interpretar el estado de la ejecución. Consultá de nuevo.');
          stopPolling();
        }
      } catch {
        if (active) {
          setOperationError('No se pudo consultar la ejecución. Consultá de nuevo sin iniciar otra tarea.');
          stopPolling();
        }
      } finally {
        inFlight = false;
      }
    };

    void checkStatus();
    const interval = window.setInterval(() => void checkStatus(), 2000);
    const timeout = window.setTimeout(() => {
      if (active) {
        setTimedOut(true);
        stopPolling();
        controller.abort();
      }
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [task, showForm, isPolling]);

  const updateCost = (row: number, column: number, value: string) => {
    setMatrix((current) => current.map((costs, rowIndex) =>
      rowIndex === row ? costs.map((cost, columnIndex) => columnIndex === column ? value : cost) : costs
    ));
    if (invalidCell?.row === row && invalidCell.column === column) setInvalidCell(null);
    setPasteFeedback(null);
  };

  const pasteCosts = (event: ClipboardEvent<HTMLInputElement>, startRow: number, startColumn: number) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes('\n')) return;
    event.preventDefault();
    const pasted = text.replace(/(?:\r?\n)+$/, '').split(/\r?\n/).map((row) => row.split('\t'));
    const width = pasted[0].length;
    if (pasted.some((row) => row.length !== width)) {
      setPasteFeedback({ text: 'El bloque copiado debe tener la misma cantidad de columnas en cada fila.', error: true });
      return;
    }
    const rowCount = Math.max(matrix.length, startRow + pasted.length);
    const columnCount = Math.max(taskNames.length, startColumn + width);
    const values: string[][] = [];
    for (let row = 0; row < pasted.length; row++) {
      const costs: string[] = [];
      for (let column = 0; column < width; column++) {
        const targetRow = startRow + row;
        const targetColumn = startColumn + column;
        const workerName = workerNames[targetRow] ?? `Empleado ${targetRow + 1}`;
        const taskName = taskNames[targetColumn] ?? `Tarea ${targetColumn + 1}`;
        if (allowed[targetRow]?.[targetColumn] === false) {
          setPasteFeedback({ text: `No se puede pegar en ${workerName} / ${taskName}: la asignación está deshabilitada.`, error: true });
          return;
        }
        const cost = normalizeCost(pasted[row][column]);
        if (cost === null) {
          setPasteFeedback({ text: `Costo inválido o vacío para ${workerName} / ${taskName}. No se cambió la matriz.`, error: true });
          return;
        }
        costs.push(cost);
      }
      values.push(costs);
    }
    setMatrix(Array.from({ length: rowCount }, (_, worker) => Array.from({ length: columnCount }, (_, task) =>
      values[worker - startRow]?.[task - startColumn] ?? matrix[worker]?.[task] ?? ''
    )));
    setAllowed(Array.from({ length: rowCount }, (_, worker) => Array.from({ length: columnCount }, (_, task) =>
      allowed[worker]?.[task] ?? true
    )));
    if (rowCount > workerNames.length) setWorkerNames([...workerNames, ...Array.from({ length: rowCount - workerNames.length }, (_, index) => `Empleado ${workerNames.length + index + 1}`)]);
    if (columnCount > taskNames.length) {
      setTaskNames([...taskNames, ...Array.from({ length: columnCount - taskNames.length }, (_, index) => `Tarea ${taskNames.length + index + 1}`)]);
      setCurrentAssignment([...currentAssignment, ...Array(columnCount - taskNames.length).fill('')]);
    }
    setInvalidCell(null);
    setPasteFeedback({ text: `Se pegaron ${pasted.length * width} costos en la matriz.${rowCount > matrix.length || columnCount > taskNames.length ? ' Se agregaron empleados o tareas; completá las celdas vacías antes de calcular.' : ''}`, error: false });
  };

  const clearFormErrors = () => {
    setValidationError(null);
    setInvalidCell(null);
    setCsvError(null);
    setPasteFeedback(null);
  };

  const loadPreset3x3 = () => {
    setWorkerNames(['Ana Martínez', 'Carlos Ruiz', 'Sofía Gómez']);
    setTaskNames(['Auditoría', 'Desarrollo', 'Soporte']);
    setMatrix([
      ['120', '190', '80'],
      ['90', '130', '110'],
      ['150', '85', '95'],
    ]);
    setAllowed([
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ]);
    setCurrentAssignment(['0', '1', '2']);
    setUnitName('USD');
    setSameUnitConfirmed(true);
    clearFormErrors();
    setComparisonError(false);
  };

  const loadPreset4x4 = () => {
    setWorkerNames(['Lucía Pérez', 'Martín Silva', 'Elena Costa', 'Diego Morales']);
    setTaskNames(['Diseño UI', 'Backend API', 'DevOps Cloud', 'QA Testing']);
    setMatrix([
      ['70', '140', '180', '90'],
      ['130', '95', '110', '85'],
      ['160', '120', '80', '100'],
      ['85', '110', '150', '65'],
    ]);
    setAllowed([
      [true, true, false, true],
      [false, true, true, true],
      [false, true, true, false],
      [true, false, false, true],
    ]);
    setCurrentAssignment(['0', '1', '2', '3']);
    setUnitName('USD');
    setSameUnitConfirmed(true);
    clearFormErrors();
    setComparisonError(false);
  };

  const resetToBasic = () => {
    setWorkerNames(['Empleado 1', 'Empleado 2']);
    setTaskNames(['Tarea 1', 'Tarea 2']);
    setMatrix([['4', '3'], ['2', '1']]);
    setAllowed([[true, true], [true, true]]);
    setCurrentAssignment(['', '']);
    setUnitName('unidades');
    setSameUnitConfirmed(true);
    clearFormErrors();
    setComparisonError(false);
  };

  const addWorker = () => {
    setMatrix((rows) => [...rows, Array(taskNames.length).fill('')]);
    setAllowed((rows) => [...rows, Array(taskNames.length).fill(true)]);
    setWorkerNames((names) => {
      let number = names.length + 1;
      while (names.includes('Empleado ' + number)) number++;
      return [...names, 'Empleado ' + number];
    });
    clearFormErrors();
  };

  const removeWorker = (removed: number) => {
    setMatrix((rows) => rows.filter((_, index) => index !== removed));
    setAllowed((rows) => rows.filter((_, index) => index !== removed));
    setWorkerNames((names) => names.filter((_, index) => index !== removed));
    setCurrentAssignment((values) => values.map((value) => {
      if (value === '') return '';
      const worker = Number(value);
      return worker === removed ? '' : String(worker > removed ? worker - 1 : worker);
    }));
    setComparisonError(false);
    clearFormErrors();
  };

  const addTask = () => {
    setMatrix((rows) => rows.map((row) => [...row, '']));
    setAllowed((rows) => rows.map((row) => [...row, true]));
    setTaskNames((names) => {
      let number = names.length + 1;
      while (names.includes('Tarea ' + number)) number++;
      return [...names, 'Tarea ' + number];
    });
    setCurrentAssignment((values) => [...values, '']);
    clearFormErrors();
  };

  const removeTask = (removed: number) => {
    setMatrix((rows) => rows.map((row) => row.filter((_, index) => index !== removed)));
    setAllowed((rows) => rows.map((row) => row.filter((_, index) => index !== removed)));
    setTaskNames((names) => names.filter((_, index) => index !== removed));
    setCurrentAssignment((values) => values.filter((_, index) => index !== removed));
    setComparisonError(false);
    clearFormErrors();
  };

  const updateAllowed = (row: number, column: number, value: boolean) => {
    setAllowed((current) => current.map((items, index) => index === row ? items.map((item, task) => task === column ? value : item) : items));
    if (!value) setCurrentAssignment((current) => current.map((worker, task) => task === column && worker === String(row) ? '' : worker));
  };

  const updateBulkAllowed = (scope: 'worker' | 'task', index: number, value: boolean) => {
    const next = allowed.map((row, worker) => row.map((item, task) =>
      (scope === 'worker' ? worker === index : task === index) ? value : item
    ));
    setAllowed(next);
    if (!value) setCurrentAssignment((current) => current.map((worker, task) =>
      worker !== '' && !next[Number(worker)]?.[task] ? '' : worker
    ));
    setComparisonError(false);
    const name = scope === 'worker' ? workerNames[index] : taskNames[index];
    setPasteFeedback({ text: `Permisos actualizados para ${name}.`, error: false });
  };

  const importCsv = async (file: File) => {
    try {
      setCsvPreview(null);
      if (file.size > 1_000_000) throw new Error('El CSV supera 1 MB.');
      const text = await file.text();
      let rows = parseCsv(text, ';');
      const delimiter = rows[0]?.length > 1 ? ';' : ',';
      if (delimiter === ',') rows = parseCsv(text, ',');
      let unit: string | null = null;
      let rowOffset = 0;
      if (rows[0]?.[0].trim().toLowerCase() === 'unidad de costos') {
        if (rows[0].length !== 2 || !rows[0][1].trim() || rows[0][1].trim().length > 30) {
          throw new Error('La línea de unidad debe tener el formato «Unidad de costos;pesos» y un nombre de hasta 30 caracteres.');
        }
        unit = rows[0][1].trim();
        rows = rows.slice(1);
        rowOffset = 1;
      }
      if (rows.length < 2 || rows[0].length < 2 || rows.some((row) => row.length !== rows[0].length)) {
        throw new Error('El CSV necesita una fila de tareas y una fila por empleado, todas con igual número de columnas.');
      }
      const importedTasks = rows[0].slice(1).map((name) => name.trim());
      const importedWorkers = rows.slice(1).map((row) => row[0].trim());
      if ([...importedTasks, ...importedWorkers].some((name) => !name)) throw new Error('Todos los empleados y tareas necesitan un nombre.');
      if (new Set(importedTasks).size !== importedTasks.length || new Set(importedWorkers).size !== importedWorkers.length) {
        throw new Error('Los nombres de empleados y tareas no pueden repetirse.');
      }
      const importedAllowed = rows.slice(1).map((row) => row.slice(1).map((value) => value.trim().toUpperCase() !== 'X'));
      const importedCosts = rows.slice(1).map((row, worker) => row.slice(1).map((value, task) => {
        if (!importedAllowed[worker][task]) return '';
        const cost = value.trim();
        const location = `Fila ${worker + 2 + rowOffset}, columna ${task + 2} (${importedWorkers[worker]} / ${importedTasks[task]})`;
        if (!cost) {
          throw new Error(`${location}: falta el costo. Completalo o usá X si esa persona no puede hacer la tarea.`);
        }
        const normalized = normalizeCost(cost);
        if (normalized === null) {
          throw new Error(`${location}: «${cost}» no es un número válido. Usá X para las asignaciones no permitidas.`);
        }
        return normalized;
      }));
      setCsvError(null);
      setCsvPreview({ fileName: file.name, unit, workerNames: importedWorkers, taskNames: importedTasks, costs: importedCosts, allowed: importedAllowed });
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'No se pudo leer el CSV.');
    }
  };

  const applyCsvPreview = () => {
    if (!csvPreview) return;
    setMatrix(csvPreview.costs);
    setAllowed(csvPreview.allowed);
    setWorkerNames(csvPreview.workerNames);
    setTaskNames(csvPreview.taskNames);
    setCurrentAssignment(Array(csvPreview.taskNames.length).fill(''));
    setUnitName(csvPreview.unit ?? '');
    setUnitNameError(false);
    setSameUnitConfirmed(false);
    clearFormErrors();
    setComparisonError(false);
    setCsvFileName(csvPreview.fileName);
    setCsvPreview(null);
  };

  const downloadCsv = () => {
    const rows = [
      ...(unitName.trim() ? [['Unidad de costos', unitName.trim()]] : []),
      ['Empleado/Tarea', ...taskNames],
      ...matrix.map((row, worker) => [workerNames[worker], ...row.map((value, task) => allowed[worker][task] ? value.replace('.', ',') : 'X')]),
    ];
    saveCsv(rows, 'optimizacion-matriz.csv');
  };

  const startOptimization = async (event: FormEvent) => {
    event.preventDefault();
    setValidationError(null);
    setInvalidCell(null);
    setUnitError(false);
    setUnitNameError(false);
    setComparisonError(false);
    setOperationError(null);

    if (!matrix.length || !matrix[0].length || matrix.some((row) => row.length !== matrix[0].length)) {
      setValidationError('La matriz debe tener al menos un empleado y una tarea, y todas las filas deben tener igual longitud.');
      return;
    }
    const names = [...workerNames.map((name) => name.trim()), ...taskNames.map((name) => name.trim())];
    if (names.some((name) => !name) || new Set(workerNames.map((name) => name.trim())).size !== workerNames.length || new Set(taskNames.map((name) => name.trim())).size !== taskNames.length) {
      setValidationError('Cada empleado y tarea necesita un nombre distinto.');
      return;
    }
    for (let row = 0; row < matrix.length; row++) {
      for (let column = 0; column < matrix[row].length; column++) {
        if (allowed[row][column] && (!matrix[row][column].trim() || !Number.isFinite(Number(matrix[row][column])))) {
          setInvalidCell({ row, column });
          document.getElementById('cost-' + row + '-' + column)?.focus();
          return;
        }
      }
    }
    if (matrix.length < matrix[0].length) {
      setValidationError('Agregá empleados hasta tener al menos uno por cada tarea.');
      document.getElementById('add-worker')?.focus();
      return;
    }
    if (feasibilityMessage) {
      setValidationError(feasibilityMessage);
      document.getElementById('eligibility-guidance')?.focus();
      return;
    }
    const hasCurrentAssignment = currentAssignment.some((worker) => worker !== '');
    if (hasCurrentAssignment && (currentAssignment.some((worker) => worker === '') || new Set(currentAssignment).size !== currentAssignment.length || currentAssignment.some((worker, task) => !allowed[Number(worker)]?.[task]))) {
      setComparisonError(true);
      document.getElementById('current-assignment-' + currentAssignment.findIndex((worker, task) => !worker || currentAssignment.indexOf(worker) !== task || !allowed[Number(worker)]?.[task]))?.focus();
      return;
    }
    if (!unitName.trim()) {
      setUnitNameError(true);
      document.getElementById('cost-unit')?.focus();
      return;
    }
    if (!sameUnitConfirmed) {
      setUnitError(true);
      document.getElementById('same-unit')?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const costs = matrix.map((row, worker) => row.map((value, task) => allowed[worker][task] ? Number(value) : 0));
      const submitted = { workerNames: workerNames.map((name) => name.trim()), taskNames: taskNames.map((name) => name.trim()), costs, allowed, unit: unitName.trim(), currentAssignment: hasCurrentAssignment ? currentAssignment.map(Number) : null };
      const response = await axios.post(API_ENDPOINTS.optimization.assignment, {
        costs,
        allowed,
        context: { workerNames: submitted.workerNames, taskNames: submitted.taskNames, unit: submitted.unit, currentAssignment: submitted.currentAssignment },
      });
      const id = response.data?.task_id;
      if (typeof id !== 'string' || !id) throw new Error('Missing task ID');

      const nextTask = { id, savedAt: Date.now() };
      try {
        localStorage.setItem(taskKey, JSON.stringify(nextTask));
        setStorageWarning(false);
      } catch {
        setStorageWarning(true);
      }
      setResult(null);
      setSubmittedMatrix(submitted);
      setInfeasible(false);
      setTimedOut(false);
      setStatus('PENDING');
      setTask(nextTask);
      setDraftTaskId(id);
      setShowForm(false);
      setIsPolling(true);
    } catch {
      setOperationError('No se pudo iniciar la optimización. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editOptimization = () => {
    if (task && submittedMatrix && draftTaskId !== task.id) {
      setMatrix(submittedMatrix.costs.map((row, worker) => row.map((cost, taskIndex) => submittedMatrix.allowed[worker][taskIndex] ? String(cost) : '')));
      setAllowed(submittedMatrix.allowed.map((row) => [...row]));
      setWorkerNames([...submittedMatrix.workerNames]);
      setTaskNames([...submittedMatrix.taskNames]);
      setCurrentAssignment(submittedMatrix.currentAssignment?.map(String) ?? Array(submittedMatrix.taskNames.length).fill(''));
      setUnitName(submittedMatrix.unit);
      setSameUnitConfirmed(true);
      setCsvFileName(null);
    }
    if (task) setDraftTaskId(task.id);
    setShowForm(true);
  };

  const consultAgain = () => {
    setOperationError(null);
    setTimedOut(false);
    setIsPolling(true);
  };

  const currentCost = submittedMatrix?.currentAssignment?.reduce((total, worker, task) => total + submittedMatrix.costs[worker][task], 0);
  const resultUnit = submittedMatrix?.unit;
  const changedTasks = submittedMatrix?.currentAssignment && result
    ? result.assignments.filter((assignment) => submittedMatrix.currentAssignment?.[assignment.task] !== assignment.worker).length : null;
  const unusedWorkers = submittedMatrix && result
    ? submittedMatrix.workerNames.filter((_, worker) => !result.assignments.some((assignment) => assignment.worker === worker)) : [];
  const sortedAssignments = result ? [...result.assignments].sort((a, b) => a.task - b.task) : [];

  const downloadResultCsv = () => {
    if (!result) return;
    const baseline = submittedMatrix?.currentAssignment;
    const rows = [
      ['Tarea', 'Empleado propuesto', `Costo propuesto${resultUnit ? ` (${resultUnit})` : ''}`,
        ...(baseline ? ['Empleado actual', `Costo actual (${resultUnit})`] : [])],
      ...sortedAssignments.map((assignment) => [
        submittedMatrix?.taskNames[assignment.task] || 'Tarea ' + (assignment.task + 1),
        submittedMatrix?.workerNames[assignment.worker] || 'Empleado ' + (assignment.worker + 1),
        String(assignment.cost),
        ...(baseline && submittedMatrix ? [submittedMatrix.workerNames[baseline[assignment.task]], String(submittedMatrix.costs[baseline[assignment.task]][assignment.task])] : []),
      ]),
      ['TOTAL', '', String(result.total_cost), ...(baseline && currentCost !== undefined ? ['', String(currentCost)] : [])],
    ];
    if (baseline && currentCost !== undefined) rows.push(['Diferencia (actual - propuesta)', '', String(Number((currentCost - result.total_cost).toFixed(6))), '', '']);
    if (!submittedMatrix) rows.push(['Nota: el contexto de esta ejecución no está disponible', '', '']);
    saveCsv(rows, `optimizacion-resultado-${task?.id ?? 'actual'}.csv`);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-glow">
            <Calculator size={13} className="text-primary" /> Google OR-Tools
          </span>
          <span className="badge-success">
            <Layers size={13} className="text-emerald-400" /> Solver MIP / SCIP
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Optimización</h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">Encontrá la asignación de tareas con el menor costo posible.</p>
      </header>

      {/* Apartado Explicativo del Módulo y Guía de Celdas */}
      <section aria-label="Información del módulo de optimización" className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/85 to-surfaceHighlight/50 p-6 sm:p-7 text-slate-200 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
            <Info size={22} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este módulo resuelve el <strong>Problema de Asignación Óptima (MIP - Mixed Integer Programming)</strong> utilizando el solver matemático <strong>SCIP de Google OR-Tools</strong> y ejecución en segundo plano mediante <strong>Celery y Redis</strong>.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>¿Para qué se usa?</strong> En cualquier organización con múltiples recursos (empleados, máquinas, vehículos o contratistas) y tareas a cumplir (turnos, rutas, proyectos o despachos), cada recurso tiene un costo o rendimiento distinto. Este motor calcula la <strong>combinación exacta de 1 empleado por tarea que logra el menor costo o tiempo total posible</strong>, eliminando el error humano de las asignaciones manuales.
            </p>
          </div>
        </div>

        {/* Guía Específica de Relleno de Celdas y Tabla */}
        <div className="mt-5 rounded-xl border border-white/10 bg-surface/90 p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-emerald-300">
            <FileSpreadsheet size={18} />
            <span>Guía de Relleno: ¿Qué se debe escribir en cada celda y fila?</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs leading-relaxed">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">1. Fila Superior (Columnas = Tareas)</span>
              <p className="text-gray-300">Escribí el nombre de la <strong>tarea, turno, ruta o proyecto</strong> a cubrir (ej: <em>"Auditoría"</em>, <em>"Desarrollo Frontend"</em>, <em>"Mantenimiento"</em>).</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">2. Columna Izquierda (Filas = Empleados / Recursos)</span>
              <p className="text-gray-300">Escribí el nombre de la <strong>persona, contratista o máquina</strong> disponible (ej: <em>"Carlos Gómez"</em>, <em>"Ana Martínez"</em>, <em>"Servidor A"</em>).</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">3. Celda Numérica (Costo o Esfuerzo)</span>
              <p className="text-gray-300">Ingresá el <strong>costo monetario o tiempo</strong> que ese empleado requiere para hacer esa tarea puntual (ej: <code>150</code> para $150 USD, u <code>8</code> para 8 horas). Debe ser un número finito positivo.</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">4. Casilla «Puede hacerla»</span>
              <p className="text-gray-300"><strong>Tildada:</strong> El recurso está habilitado. <strong>Destildada:</strong> Bloquea la asignación porque el empleado no está calificado o no tiene disponibilidad (en Excel se coloca <code>X</code>).</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">5. Asignación Actual (Opcional)</span>
              <p className="text-gray-300">Seleccioná quién hace hoy cada tarea en tu empresa para que el sistema calcule el <strong>ahorro exacto</strong> comparado con la solución óptima.</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">6. Unidad de los Costos</span>
              <p className="text-gray-300">Indicá la medida compartida por toda la tabla (ej: <code>USD</code>, <code>pesos</code>, <code>horas</code>) para que los totales tengan coherencia de negocio.</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-400/20 bg-blue-400/10 p-2.5 text-xs text-blue-200">
            💡 <strong>Cómo estructurar tu archivo Excel / CSV para importarlo:</strong> La primera fila debe contener los nombres de las tareas. La primera columna debe tener los nombres de los empleados. Las celdas intermedias contienen los números de costo o la letra <code>X</code> para bloquear una asignación.
          </div>
        </div>
      </section>

      <section aria-label="Optimización de asignaciones" className="glass-card p-5 sm:p-6">
        {showForm ? (
          <form onSubmit={(event) => void startOptimization(event)} noValidate>
            <h2 className="text-xl font-semibold text-white">Matriz de costos</h2>
            <p className="mt-2 text-sm text-gray-300">{submittedMatrix ? 'Editá los datos de la ejecución anterior.' : 'Empezá con esta matriz de ejemplo.'} Cada tarea requiere un empleado distinto.</p>
            {task && <div className="mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="min-h-11 text-sm text-blue-200 underline underline-offset-4">Volver al resultado anterior</button>
              {!submittedMatrix && !isPolling && <p className="mt-2 text-sm text-amber-200">No se recuperó la matriz anterior. Podés usar el ejemplo; el resultado se conserva hasta iniciar otra ejecución.</p>}
            </div>}

            {/* Barra de Plantillas Rápidas para Carga Inmediata */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
                <Sparkles size={16} className="text-primary" />
                <span>Plantillas Rápidas:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadPreset3x3}
                  disabled={isSubmitting}
                  className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-blue-200 hover:bg-primary/20 transition-colors"
                >
                  ⚡ Cargar Ejemplo 3x3 (Pymes)
                </button>
                <button
                  type="button"
                  onClick={loadPreset4x4}
                  disabled={isSubmitting}
                  className="rounded-lg border border-purple-400/40 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  🏢 Cargar Ejemplo 4x4 (Tecnología)
                </button>
                <button
                  type="button"
                  onClick={resetToBasic}
                  disabled={isSubmitting}
                  className="rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs text-gray-300 hover:bg-white/10 transition-colors"
                >
                  🔄 Restablecer 2x2
                </button>
              </div>
            </div>

            {operationError && <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{operationError}</p>}
            {validationError && <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{validationError}</p>}
            {csvError && <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">{csvError}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="relative inline-flex min-h-11 items-center rounded-lg border border-white/20 px-3 py-2 text-sm text-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                Importar CSV
                <input id="matrix-csv" type="file" accept=".csv,text/csv" aria-label="Importar matriz CSV" disabled={isSubmitting} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCsv(file); event.target.value = ''; }} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
              </label>
              <button type="button" disabled={isSubmitting} onClick={() => downloadCsv()} className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50">Descargar CSV</button>
            </div>
            {csvFileName && <p className="mt-2 break-all text-sm text-emerald-300">CSV importado: {csvFileName}</p>}
            <details className="mt-3 text-sm text-gray-300">
              <summary className="w-fit cursor-pointer text-blue-200">Formato CSV y pegado</summary>
              <div className="mt-2 max-w-2xl space-y-2 leading-relaxed">
                <p>En el CSV, la primera fila contiene las tareas y la primera columna, los empleados. Usá X para impedir una asignación. Se aceptan comas o punto y coma; podés agregar «Unidad de costos;pesos» al inicio.</p>
                <p>También podés pegar un bloque de costos desde Excel a partir de una celda. La matriz crecerá si hace falta.</p>
              </div>
            </details>
            {csvPreview && (
              <section aria-label="Vista previa del CSV" className="mt-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
                <h3 className="font-semibold text-white">Revisar CSV antes de importar</h3>
                <p className="mt-1 break-all text-sm text-gray-300">{csvPreview.fileName}: {csvPreview.workerNames.length} empleados y {csvPreview.taskNames.length} tareas. Al confirmar se reemplazará la matriz y se quitará la comparación actual. {csvPreview.unit ? `Unidad de costos: ${csvPreview.unit}.` : 'El CSV no incluye la unidad de los costos.'}</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-max border-collapse text-left text-sm text-gray-200">
                    <thead><tr><th scope="col" className="border-b border-white/20 px-3 py-2">Empleado</th>{csvPreview.taskNames.map((name, task) => <th key={task} scope="col" className="border-b border-white/20 px-3 py-2">{name}</th>)}</tr></thead>
                    <tbody>{csvPreview.workerNames.slice(0, 5).map((name, worker) => <tr key={worker}><th scope="row" className="border-b border-white/10 px-3 py-2 font-medium">{name}</th>{csvPreview.costs[worker].map((cost, task) => <td key={task} className="border-b border-white/10 px-3 py-2">{csvPreview.allowed[worker][task] ? cost || 'Vacío' : 'X'}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                {csvPreview.workerNames.length > 5 && <p className="mt-2 text-sm text-gray-300">Se muestran los primeros 5 empleados; se importarán los {csvPreview.workerNames.length}.</p>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={applyCsvPreview} className="min-h-11 rounded-lg bg-primaryDark px-4 py-2 font-semibold text-white hover:bg-blue-800">Reemplazar matriz</button>
                  <button type="button" onClick={() => setCsvPreview(null)} className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/5">Cancelar</button>
                </div>
              </section>
            )}

            <div className="mt-5 rounded-xl border border-white/10 bg-surface/50 md:max-h-[60vh] md:overflow-auto shadow-inner">
              <table className="block w-full border-collapse text-left text-sm md:table md:min-w-max">
                <thead className="block text-gray-200 md:table-header-group">
                  <tr className="block p-4 md:table-row md:p-0">
                    <th scope="col" className="block pb-3 text-left font-semibold md:sticky md:left-0 md:top-0 md:z-30 md:table-cell md:align-top md:bg-surface md:px-4 md:py-3.5 border-b border-white/10">
                      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
                        <Users size={14} className="text-secondary" />
                        <span className="hidden md:inline">Empleados \ Tareas</span>
                        <span className="md:hidden">Tareas</span>
                      </div>
                    </th>
                    {taskNames.map((name, column) => (
                      <th key={column} scope="col" className="block pb-3 text-left font-semibold md:sticky md:top-0 md:z-20 md:table-cell md:bg-surface md:px-3 md:py-3.5 border-b border-white/10">
                        <div className="flex items-center justify-between gap-1 mb-1.5 md:w-44">
                          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-300">
                            <Layers size={11} /> Tarea {column + 1}
                          </span>
                          {taskNames.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTask(column)}
                              disabled={isSubmitting}
                              aria-label={'Quitar tarea: ' + (name.trim() || 'Tarea ' + (column + 1))}
                              title={'Quitar tarea: ' + (name.trim() || 'Tarea ' + (column + 1))}
                              className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                            >
                              −
                            </button>
                          )}
                        </div>
                        <div className="relative md:w-44">
                          <input
                            type="text"
                            value={name}
                            onChange={(event) => setTaskNames((names) => names.map((item, index) => index === column ? event.target.value : item))}
                            aria-label={'Nombre de la tarea ' + (column + 1)}
                            disabled={isSubmitting}
                            maxLength={80}
                            placeholder={'Tarea ' + (column + 1)}
                            className="premium-input min-h-10 w-full text-xs font-medium"
                          />
                        </div>
                        <div className="mt-1.5 flex gap-1 md:w-44">
                          <button
                            type="button"
                            onClick={() => updateBulkAllowed('task', column, true)}
                            disabled={isSubmitting}
                            aria-label={'Permitir a todos los empleados en ' + (name.trim() || 'Tarea ' + (column + 1))}
                            className="min-h-7 flex-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                          >
                            Permitir
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBulkAllowed('task', column, false)}
                            disabled={isSubmitting}
                            aria-label={'Bloquear a todos los empleados en ' + (name.trim() || 'Tarea ' + (column + 1))}
                            className="min-h-7 flex-1 rounded border border-red-500/30 bg-red-500/10 px-1 text-[11px] font-medium text-red-300 hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                          >
                            Bloquear
                          </button>
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="block text-left md:sticky md:top-0 md:z-20 md:table-cell md:w-28 md:align-top md:bg-surface md:px-3 md:py-3.5 border-b border-white/10">
                      <button
                        type="button"
                        onClick={addTask}
                        disabled={isSubmitting}
                        aria-label="Agregar tarea"
                        className="min-h-10 whitespace-nowrap rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                      >
                        + Tarea
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="block space-y-3 px-3 pb-3 text-gray-200 md:table-row-group md:space-y-0 md:divide-y md:divide-white/10 md:px-0 md:pb-0">
                  {matrix.map((row, rowIndex) => (
                    <tr key={rowIndex} className="block min-w-0 rounded-lg border border-white/10 bg-white/[0.02] p-3 md:table-row md:rounded-none md:border-0 md:bg-transparent md:p-0 hover:bg-white/[0.015] transition-colors">
                      <th scope="row" className="block min-w-0 pb-3 text-left font-medium md:sticky md:left-0 md:z-10 md:table-cell md:align-top md:bg-surface md:px-4 md:py-3 border-r border-white/5">
                        <div className="flex items-center justify-between gap-1 mb-1.5 md:w-40">
                          <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-purple-300">
                            <Users size={11} /> Empleado {rowIndex + 1}
                          </span>
                          {matrix.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWorker(rowIndex)}
                              disabled={isSubmitting}
                              aria-label={'Quitar empleado: ' + (workerNames[rowIndex].trim() || 'Empleado ' + (rowIndex + 1))}
                              title={'Quitar empleado: ' + (workerNames[rowIndex].trim() || 'Empleado ' + (rowIndex + 1))}
                              className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                            >
                              −
                            </button>
                          )}
                        </div>
                        <div className="relative md:w-40">
                          <input
                            type="text"
                            value={workerNames[rowIndex]}
                            onChange={(event) => setWorkerNames((names) => names.map((item, index) => index === rowIndex ? event.target.value : item))}
                            aria-label={'Nombre del empleado ' + (rowIndex + 1)}
                            disabled={isSubmitting}
                            maxLength={80}
                            placeholder={'Empleado ' + (rowIndex + 1)}
                            className="premium-input min-h-10 w-full text-xs font-medium"
                          />
                        </div>
                        <div className="mt-1.5 flex gap-1 md:w-40">
                          <button
                            type="button"
                            onClick={() => updateBulkAllowed('worker', rowIndex, true)}
                            disabled={isSubmitting}
                            aria-label={'Permitir todas las tareas a ' + (workerNames[rowIndex].trim() || 'Empleado ' + (rowIndex + 1))}
                            className="min-h-7 flex-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                          >
                            Permitir
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBulkAllowed('worker', rowIndex, false)}
                            disabled={isSubmitting}
                            aria-label={'Bloquear todas las tareas a ' + (workerNames[rowIndex].trim() || 'Empleado ' + (rowIndex + 1))}
                            className="min-h-7 flex-1 rounded border border-red-500/30 bg-red-500/10 px-1 text-[11px] font-medium text-red-300 hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                          >
                            Bloquear
                          </button>
                        </div>
                      </th>
                      {row.map((value, columnIndex) => {
                        const isCellAllowed = allowed[rowIndex][columnIndex];
                        const invalid = invalidCell?.row === rowIndex && invalidCell.column === columnIndex;
                        const workerLabel = workerNames[rowIndex].trim() || 'Empleado ' + (rowIndex + 1);
                        const taskLabel = taskNames[columnIndex].trim() || 'Tarea ' + (columnIndex + 1);
                        return (
                          <td key={columnIndex} className="block min-w-0 border-t border-white/10 py-3 last:pb-0 md:table-cell md:align-top md:border-0 md:px-3 md:py-3">
                            <span className="mb-1 block font-medium md:hidden">{taskLabel}</span>
                            <div className={`rounded-lg border p-2 transition-all md:w-44 ${
                              isCellAllowed
                                ? 'border-white/10 bg-white/[0.02] focus-within:border-primary/60 focus-within:bg-primary/[0.02]'
                                : 'border-dashed border-red-500/20 bg-red-500/[0.02] opacity-75'
                            }`}>
                              <div className="relative">
                                <input
                                  id={'cost-' + rowIndex + '-' + columnIndex}
                                  type="number"
                                  step="any"
                                  value={isCellAllowed ? value : ''}
                                  onChange={(event) => updateCost(rowIndex, columnIndex, event.target.value)}
                                  onPaste={(event) => pasteCosts(event, rowIndex, columnIndex)}
                                  aria-label={'Costo de ' + workerLabel + ' para ' + taskLabel}
                                  aria-invalid={invalid}
                                  aria-describedby={invalid ? 'cost-error-' + rowIndex + '-' + columnIndex : undefined}
                                  disabled={isSubmitting || !isCellAllowed}
                                  placeholder={isCellAllowed ? (unitName ? `0.00 ${unitName}` : '0.00') : 'No asignable'}
                                  className={`premium-input min-h-10 w-full text-sm font-mono ${!isCellAllowed ? 'cursor-not-allowed bg-black/20 text-gray-500 placeholder-gray-500' : ''}`}
                                />
                              </div>
                              <label className="mt-2 flex items-center justify-between gap-2 text-xs cursor-pointer select-none">
                                <span className="flex items-center gap-1.5 text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={isCellAllowed}
                                    onChange={(event) => updateAllowed(rowIndex, columnIndex, event.target.checked)}
                                    aria-label={workerLabel + ' puede hacer ' + taskLabel}
                                    disabled={isSubmitting}
                                    className="h-4 w-4 rounded accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                                  />
                                  <span className={isCellAllowed ? 'text-gray-200' : 'text-gray-400'}>Puede hacerla</span>
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isCellAllowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {isCellAllowed ? 'Habilitada' : 'X Bloqueada'}
                                </span>
                              </label>
                              {invalid && <p id={'cost-error-' + rowIndex + '-' + columnIndex} className="mt-1 text-xs text-red-200">Ingresá un número válido.</p>}
                            </div>
                          </td>
                        );
                      })}
                      <td className="hidden md:table-cell" />
                    </tr>
                  ))}
                  <tr className="block px-3 pb-3 md:table-row md:p-0">
                    <th scope="row" className="block text-left md:sticky md:left-0 md:table-cell md:bg-surface md:px-4 md:py-3.5">
                      <button
                        id="add-worker"
                        type="button"
                        disabled={isSubmitting}
                        onClick={addWorker}
                        aria-label="Agregar empleado"
                        className="min-h-10 whitespace-nowrap rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                      >
                        + Empleado
                      </button>
                    </th>
                    <td colSpan={taskNames.length + 1} className="hidden md:table-cell" />
                  </tr>
                </tbody>
              </table>
            </div>
            {pasteFeedback && <p role={pasteFeedback.error ? 'alert' : 'status'} className={'mt-3 text-sm ' + (pasteFeedback.error ? 'text-red-200' : 'text-emerald-300')}>{pasteFeedback.text}</p>}
            {feasibilityMessage && <p id="eligibility-guidance" tabIndex={-1} role="status" className="mt-3 rounded-lg border border-amber-300/40 bg-amber-300/10 p-3 text-sm text-amber-100">{feasibilityMessage} Revisá las casillas «Puede hacerla».</p>}

            <section aria-labelledby="current-heading" className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Users size={16} />
                    </div>
                    <h3 id="current-heading" className="text-lg font-semibold text-white">Asignación actual (opcional)</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">
                    Elegí un empleado por tarea para comparar costos. Dejá todo sin seleccionar si no querés comparar.
                  </p>
                </div>

                {currentAssignment.some((value) => value !== '') && (
                  <button
                    type="button"
                    onClick={() => { setCurrentAssignment(Array(taskNames.length).fill('')); setComparisonError(false); }}
                    className="min-h-9 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20 underline underline-offset-4 transition-colors"
                  >
                    Quitar comparación
                  </button>
                )}
              </div>

              {/* Barra de progreso y resumen en vivo */}
              <div className="mt-4 rounded-lg border border-white/10 bg-surface/80 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-gray-300">
                    Progreso de asignación: <strong className="text-white">{selectedCount}</strong> de <strong className="text-white">{taskNames.length}</strong> tareas
                  </span>
                  {draftCurrentCost !== null && unitName.trim() && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-semibold text-emerald-300">
                      Costo actual acumulado: {draftCurrentCost} {unitName.trim()}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(selectedCount / taskNames.length) * 100}%` }}
                  />
                </div>
                <p role="status" className="mt-2.5 text-sm text-gray-200">
                  {selectedCount === 0
                    ? 'Sin comparación seleccionada.'
                    : draftCurrentCost !== null && unitName.trim()
                      ? `Asignadas ${selectedCount} de ${taskNames.length} tareas. Costo actual: ${draftCurrentCost} ${unitName.trim()}.`
                      : selectedCount < taskNames.length
                        ? `Asignadas ${selectedCount} de ${taskNames.length} tareas. Faltan ${taskNames.length - selectedCount}.`
                        : !unitName.trim()
                          ? 'Escribí la unidad de los costos para ver el total actual.'
                          : 'Revisá los costos y permisos de la asignación actual para calcular el total.'}
                </p>
              </div>

              {/* Tarjetas individuales de asignación por tarea */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {taskNames.map((name, task) => {
                  const worker = currentAssignment[task];
                  const assignedWorkerIndex = worker !== '' ? Number(worker) : null;
                  const assignedCost = assignedWorkerIndex !== null ? matrix[assignedWorkerIndex]?.[task] : null;
                  const invalid = comparisonError && currentAssignment.some((selected) => selected !== '') &&
                    (!worker || currentAssignment.indexOf(worker) !== task || !allowed[Number(worker)]?.[task]);

                  return (
                    <div
                      key={task}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        assignedWorkerIndex !== null
                          ? 'border-primary/40 bg-primary/[0.04]'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/20 text-[10px] text-blue-300 font-mono">
                              T{task + 1}
                            </span>
                            <span className="truncate">{name || 'Tarea ' + (task + 1)}</span>
                          </span>
                          {assignedWorkerIndex !== null && assignedCost !== undefined && (
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-mono text-emerald-300">
                              {assignedCost} {unitName || ''}
                            </span>
                          )}
                        </div>

                        <label htmlFor={'current-assignment-' + task} className="block text-xs text-gray-300">
                          <span className="mb-1 block text-gray-400 font-medium">{name || 'Tarea ' + (task + 1)}</span>
                          <select
                            id={'current-assignment-' + task}
                            value={worker}
                            onChange={(event) => {
                              setCurrentAssignment((values) => values.map((value, index) => index === task ? event.target.value : value));
                              setComparisonError(false);
                            }}
                            disabled={isSubmitting}
                            aria-invalid={invalid}
                            aria-describedby={invalid ? 'current-error-' + task : undefined}
                            aria-label={'Empleado actual para ' + (name || 'tarea ' + (task + 1))}
                            className="premium-input min-h-11 w-full text-sm"
                          >
                            <option value="">Sin seleccionar</option>
                            {workerNames.map((workerName, index) => allowed[index][task] && (
                              <option
                                key={index}
                                value={index}
                                disabled={currentAssignment.some((selected, otherTask) => otherTask !== task && selected === String(index))}
                              >
                                {workerName || 'Empleado ' + (index + 1)} (costo: {matrix[index]?.[task] ?? '-'}{unitName ? ' ' + unitName : ''})
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {invalid && (
                        <span id={'current-error-' + task} className="mt-2 block text-xs font-medium text-red-300">
                          {!worker ? 'Elegí un empleado o quitá la comparación.' : 'Este empleado ya está asignado a otra tarea.'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="mt-6">
              <label htmlFor="cost-unit" className="block text-sm font-medium text-gray-200">Unidad de los costos</label>
              <input id="cost-unit" type="text" value={unitName} onChange={(event) => { setUnitName(event.target.value); setUnitNameError(false); }} aria-invalid={unitNameError} aria-describedby={unitNameError ? 'unit-name-error' : 'cost-guidance'} disabled={isSubmitting} maxLength={30} placeholder="Ej.: pesos, horas o puntos" className="premium-input mt-2 min-h-11 max-w-xs" />
              {unitNameError && <p id="unit-name-error" role="alert" className="mt-2 text-sm text-red-200">Escribí la unidad de los costos, por ejemplo pesos, horas o puntos.</p>}
              <p id="cost-guidance" className="mt-2 text-sm text-gray-300">Usá la misma unidad en todos los costos: pesos, horas o puntos.</p>
              <label htmlFor="same-unit" className="mt-4 flex items-start gap-3 text-sm text-gray-200">
                <input id="same-unit" type="checkbox" checked={sameUnitConfirmed} onChange={(event) => { setSameUnitConfirmed(event.target.checked); setUnitError(false); }} aria-invalid={unitError} aria-describedby={unitError ? 'unit-error' : 'cost-guidance'} disabled={isSubmitting} className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
                <span>Todos los costos de esta matriz usan la misma unidad.</span>
              </label>
              {unitError && <p id="unit-error" role="alert" className="mt-2 text-sm text-red-200">Confirmá la unidad común antes de iniciar la optimización.</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="mt-6 min-h-12 rounded-xl bg-gradient-to-r from-blue-600 via-primary to-blue-500 px-6 font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50">
              {isSubmitting ? 'Iniciando optimización…' : 'Iniciar optimización'}
            </button>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Ejecución de optimización</h2>
            <p className="mt-2 break-all text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-xl border border-white/10">ID de ejecución: <code className="text-primary font-bold">{task?.id}</code></p>
            {storageWarning && <p role="alert" className="mt-4 text-sm text-amber-200">No se pudo guardar este ID en el navegador. La ejecución no se recuperará tras recargar la página.</p>}
            <p className="mt-3 text-xs uppercase tracking-wider font-semibold text-slate-400">Estado: <span className="text-white font-bold">{result ? 'Solución disponible' : infeasible ? 'No factible' : operationError ? 'Error' : timedOut ? 'Consulta pausada' : status === 'STARTED' ? 'Procesando' : status === 'RETRY' ? 'Reintentando' : 'En cola'}</span></p>

            <div aria-live="polite" aria-atomic="true" className="mt-6">
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                      Solución {result.status === 'OPTIMAL' ? 'óptima' : 'factible'}
                    </span>
                    {changedTasks !== null && <span className="text-xs text-slate-300">{changedTasks === 0 ? 'La propuesta mantiene la asignación actual.' : `La propuesta cambia ${changedTasks} de ${result.assignments.length} tareas.`}</span>}
                  </div>
                  <section className="min-w-0 rounded-2xl border border-white/10 bg-black/30 p-5">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">{submittedMatrix?.currentAssignment ? 'Comparación por tarea' : 'Asignación propuesta'}</h3>
                    <ul className="mt-4 divide-y divide-white/10 text-sm text-slate-200">
                      {sortedAssignments.map((assignment) => {
                        const currentWorker = submittedMatrix?.currentAssignment?.[assignment.task];
                        const changed = currentWorker !== undefined && currentWorker !== assignment.worker;
                        return <li key={assignment.task} className={'grid min-w-0 gap-2 py-3 ' + (currentWorker !== undefined ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
                          <span className="break-words font-semibold text-white">{submittedMatrix?.taskNames[assignment.task] || 'Tarea ' + (assignment.task + 1)}</span>
                          {currentWorker !== undefined && <span className="min-w-0 break-words"><span className="block text-xs text-slate-400">Actual</span>{submittedMatrix?.workerNames[currentWorker]} · Costo: {submittedMatrix?.costs[currentWorker][assignment.task]}{resultUnit && ' ' + resultUnit}</span>}
                          <span className="min-w-0 break-words"><span className="block text-xs text-slate-400">Propuesta</span>{submittedMatrix?.workerNames[assignment.worker] || 'Empleado ' + (assignment.worker + 1)} · Costo: {assignment.cost}{resultUnit && ' ' + resultUnit}{changed && <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300 font-semibold border border-amber-500/30">Cambio</span>}</span>
                        </li>;
                      })}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 font-bold text-white text-base">
                      {currentCost !== undefined && <p className="text-slate-200">Total actual: {currentCost}{resultUnit && ' ' + resultUnit}</p>}
                      <p className="text-emerald-400">Total propuesto: {result.total_cost}{resultUnit && ' ' + resultUnit}</p>
                    </div>
                  </section>
                  {currentCost !== undefined && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-bold text-white flex items-center justify-between">
                      <span>{currentCost >= result.total_cost ? 'Ahorro estimado' : 'La propuesta cuesta más que la asignación actual'}:</span>
                      <span className="font-mono text-xl text-emerald-400">{Math.abs(Number((currentCost - result.total_cost).toFixed(6)))}{resultUnit && ' ' + resultUnit}</span>
                    </div>
                  )}
                  {unusedWorkers.length > 0 && <p className="text-xs text-slate-400">Sin tarea en la propuesta: {unusedWorkers.join(', ')}.</p>}
                  {!submittedMatrix && <p className="text-xs text-amber-200">No se pudo recuperar el contexto de esta ejecución. Los nombres, la unidad y la comparación no están disponibles.</p>}
                </div>
              ) : infeasible ? (
                <p className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-amber-100 font-medium">No factible: el motor no encontró una asignación que cumpla las condiciones. {infeasibilityDetail || 'Cada tarea necesita un empleado permitido y distinto. Revisá las casillas «Puede hacerla» antes de iniciar otra optimización.'}</p>
              ) : operationError ? (
                <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-red-100 font-medium">{operationError}</p>
              ) : timedOut ? (
                <p className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-amber-100 font-medium">La ejecución puede seguir en proceso. Consultá el mismo ID de nuevo; no hace falta iniciar otra tarea.</p>
              ) : (
                <p role="status" className="flex items-center gap-3 text-sm text-slate-300 animate-pulse">
                  <Loader2 size={20} aria-hidden="true" className="animate-spin text-primary" />
                  {status === 'STARTED' ? 'Procesando la matriz…' : status === 'RETRY' ? 'Reintentando el cálculo…' : 'Consultando el estado…'}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {!isPolling && !result && !infeasible && status !== 'SUCCESS' && status !== 'FAILURE' && (
                <button type="button" onClick={consultAgain} className="min-h-12 rounded-xl bg-gradient-to-r from-blue-600 via-primary to-blue-500 px-5 font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all">Consultar de nuevo</button>
              )}
              <button type="button" onClick={editOptimization} className={`min-h-12 rounded-xl px-5 font-semibold text-white transition-all ${result ? 'bg-gradient-to-r from-blue-600 to-primary shadow-md hover:brightness-110' : 'border border-white/20 hover:bg-white/10'}`}>{submittedMatrix ? 'Editar matriz' : 'Crear otra matriz'}</button>
              {result && <button type="button" onClick={downloadResultCsv} className="min-h-12 rounded-xl border border-white/20 px-5 font-semibold text-white hover:bg-white/10 transition-all">Descargar resultado CSV</button>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
