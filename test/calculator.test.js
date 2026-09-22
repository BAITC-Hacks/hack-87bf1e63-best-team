const test = require('node:test');
const assert = require('node:assert');
const C = require('../src/calculator');

// Прогоняет последовательность нажатий и возвращает то, что видно на экране.
function press(...keys) {
  let state = C.createState();
  for (const key of keys) {
    if (/^\d$/.test(key)) state = C.inputDigit(state, key);
    else if ('+-*/%'.includes(key) && key !== '=') state = C.chooseOperator(state, key);
    else if (key === '.') state = C.inputDecimal(state);
    else if (key === '=') state = C.equals(state);
    else if (key === 'C') state = C.clear();
    else if (key === '±') state = C.negate(state);
    else if (key === 'pct') state = C.percent(state);
    else if (key === '<') state = C.backspace(state);
    else throw new Error(`неизвестная клавиша: ${key}`);
  }
  return state.current;
}

test('базовая арифметика', () => {
  assert.strictEqual(press('2', '+', '3', '='), '5');
  assert.strictEqual(press('9', '-', '4', '='), '5');
  assert.strictEqual(press('6', '*', '7', '='), '42');
  assert.strictEqual(press('8', '/', '2', '='), '4');
});

test('многозначные числа и дроби', () => {
  assert.strictEqual(press('1', '2', '3', '+', '7', '='), '130');
  assert.strictEqual(press('1', '.', '5', '*', '2', '='), '3');
});

test('погрешность плавающей точки сглажена', () => {
  assert.strictEqual(press('0', '.', '1', '+', '0', '.', '2', '='), '0.3');
});

test('цепочка операций считается на лету', () => {
  assert.strictEqual(press('2', '+', '3', '*', '4', '='), '20');
});

test('деление на ноль даёт ошибку, а не Infinity', () => {
  assert.strictEqual(press('5', '/', '0', '='), 'Деление на ноль');
});

test('после ошибки ввод цифры начинает новый расчёт', () => {
  let state = C.chooseOperator(C.inputDigit(C.createState(), '5'), '/');
  state = C.equals(C.inputDigit(state, '0'));
  assert.ok(state.error);
  state = C.inputDigit(state, '7');
  assert.strictEqual(state.current, '7');
  assert.strictEqual(state.error, null);
});

test('смена оператора не добавляет лишнюю операцию', () => {
  assert.strictEqual(press('8', '+', '*', '2', '='), '16');
});

test('только одна десятичная точка', () => {
  assert.strictEqual(press('1', '.', '2', '.', '3'), '1.23');
});

test('смена знака и процент', () => {
  assert.strictEqual(press('5', '±'), '-5');
  assert.strictEqual(press('5', '±', '±'), '5');
  assert.strictEqual(press('5', '0', 'pct'), '0.5');
});

test('backspace удаляет последний символ', () => {
  assert.strictEqual(press('1', '2', '3', '<'), '12');
  assert.strictEqual(press('7', '<'), '0');
});

test('сброс возвращает ноль', () => {
  assert.strictEqual(press('1', '2', '+', 'C'), '0');
});

test('остаток от деления', () => {
  assert.strictEqual(press('7', '%', '4', '='), '3');
});
