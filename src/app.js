// Связывает ядро калькулятора с интерфейсом: мышь и клавиатура.
(function () {
  const C = window.Calculator;
  const display = document.getElementById('display');
  let state = C.createState();

  function render() {
    display.textContent = state.current.replace('.', ',');
    display.classList.toggle('display--error', Boolean(state.error));
  }

  function handle(action, value) {
    switch (action) {
      case 'digit': state = C.inputDigit(state, value); break;
      case 'operator': state = C.chooseOperator(state, value); break;
      case 'decimal': state = C.inputDecimal(state); break;
      case 'equals': state = C.equals(state); break;
      case 'clear': state = C.clear(); break;
      case 'negate': state = C.negate(state); break;
      case 'percent': state = C.percent(state); break;
      case 'backspace': state = C.backspace(state); break;
    }
    render();
  }

  document.querySelector('.keys').addEventListener('click', (event) => {
    const key = event.target.closest('.key');
    if (!key) return;
    if (key.dataset.digit !== undefined) handle('digit', key.dataset.digit);
    else if (key.dataset.operator !== undefined) handle('operator', key.dataset.operator);
    else handle(key.dataset.action);
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key >= '0' && key <= '9') handle('digit', key);
    else if ('+-*/%'.includes(key)) handle('operator', key);
    else if (key === '.' || key === ',') handle('decimal');
    else if (key === 'Enter' || key === '=') { event.preventDefault(); handle('equals'); }
    else if (key === 'Backspace') handle('backspace');
    else if (key === 'Escape') handle('clear');
    else return;
  });

  render();
})();
