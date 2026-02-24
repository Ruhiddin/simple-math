import type { Operator } from './evaluateExpression';

const symbols: Record<Operator, string> = {
  plus: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

export const formatExpression = (numbers: number[], operators: Operator[]): string =>
  numbers
    .map((value, index) => {
      if (index === 0) {
        return String(value);
      }

      return `${symbols[operators[index - 1]]} ${value}`;
    })
    .join(' ');
