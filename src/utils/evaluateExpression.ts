export type Operator = 'plus' | 'subtract' | 'multiply' | 'divide';

const precedence = (op: Operator): number => (op === 'multiply' || op === 'divide' ? 2 : 1);

const apply = (a: number, b: number, op: Operator): number => {
  switch (op) {
    case 'plus':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      return a / b;
  }
};

export const evaluateExpression = (numbers: number[], operators: Operator[]): number => {
  const valueStack: number[] = [numbers[0]];
  const opStack: Operator[] = [];

  operators.forEach((operator, index) => {
    const incoming = numbers[index + 1];

    while (opStack.length > 0 && precedence(opStack[opStack.length - 1]) >= precedence(operator)) {
      const right = valueStack.pop()!;
      const left = valueStack.pop()!;
      valueStack.push(apply(left, right, opStack.pop()!));
    }

    opStack.push(operator);
    valueStack.push(incoming);
  });

  while (opStack.length > 0) {
    const right = valueStack.pop()!;
    const left = valueStack.pop()!;
    valueStack.push(apply(left, right, opStack.pop()!));
  }

  return Number(valueStack[0].toFixed(2));
};
