// Ядро калькулятора: чистые функции, без обращения к DOM.

const OPERATIONS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (b === 0) throw new Error('Деление на ноль');
    return a / b;
  },
  '%': (a, b) => {
    if (b === 0) throw new Error('Деление на ноль');
    return a % b;
  },
};

function apply(operator, a, b) {
  const op = OPERATIONS[operator];
  if (!op) throw new Error(`Неизвестная операция: ${operator}`);
  const result = op(a, b);
  if (!Number.isFinite(result)) throw new Error('Некорректный результат');
  return result;
}

// Округляем «хвосты» двоичной арифметики: 0.1 + 0.2 -> 0.3
function round(value) {
  return Number.parseFloat(value.toPrecision(12));
}

// Состояние калькулятора неизменяемое: каждое действие возвращает новое.
function createState() {
  return { current: '0', accumulator: null, operator: null, replaceCurrent: true, error: null };
}

function inputDigit(state, digit) {
  if (state.error) state = createState();
  const current = state.replaceCurrent || state.current === '0' ? String(digit) : state.current + digit;
  return { ...state, current, replaceCurrent: false };
}

function inputDecimal(state) {
  if (state.error) state = createState();
  if (state.replaceCurrent) return { ...state, current: '0.', replaceCurrent: false };
  if (state.current.includes('.')) return state;
  return { ...state, current: state.current + '.', replaceCurrent: false };
}

function chooseOperator(state, operator) {
  if (state.error) return state;
  const value = Number(state.current);
  // Два оператора подряд — просто меняем последний.
  if (state.operator !== null && state.replaceCurrent) {
    return { ...state, operator };
  }
  if (state.accumulator === null) {
    return { ...state, accumulator: value, operator, replaceCurrent: true };
  }
  try {
    const result = round(apply(state.operator, state.accumulator, value));
    return { ...state, current: String(result), accumulator: result, operator, replaceCurrent: true };
  } catch (e) {
    return { ...createState(), current: e.message, error: e.message };
  }
}

function equals(state) {
  if (state.error || state.operator === null || state.accumulator === null) return state;
  try {
    const result = round(apply(state.operator, state.accumulator, Number(state.current)));
    return { ...createState(), current: String(result), replaceCurrent: true };
  } catch (e) {
    return { ...createState(), current: e.message, error: e.message };
  }
}

function negate(state) {
  if (state.error) return state;
  if (state.current === '0') return state;
  const current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  return { ...state, current };
}

function percent(state) {
  if (state.error) return state;
  return { ...state, current: String(round(Number(state.current) / 100)), replaceCurrent: false };
}

function backspace(state) {
  if (state.error) return createState();
  if (state.replaceCurrent) return state;
  const trimmed = state.current.slice(0, -1);
  const current = trimmed === '' || trimmed === '-' ? '0' : trimmed;
  return { ...state, current, replaceCurrent: current === '0' };
}

function clear() {
  return createState();
}

const api = { OPERATIONS, apply, round, createState, inputDigit, inputDecimal, chooseOperator, equals, negate, percent, backspace, clear };

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.Calculator = api;
